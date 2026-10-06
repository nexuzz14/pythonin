import type {
  PythonErrorDetail,
  RunResult,
  RunnerStatus,
  WorkerOutMessage,
} from '@/types/runner';

type StatusListener = (status: RunnerStatus, errorMessage?: string) => void;

const TIMEOUT_MS = 5000;

export class PyodideRunner {
  private static instance: PyodideRunner | null = null;

  private worker: Worker | null = null;
  private status: RunnerStatus = 'idle';
  private lastErrorMessage: string = '';
  private listeners: Set<StatusListener> = new Set();

  private activeExecutionId: string | null = null;
  private activeResolve: ((result: RunResult) => void) | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private isInitializing: boolean = false;

  private constructor() {
    // Singleton private constructor
  }

  public static getInstance(): PyodideRunner {
    if (!PyodideRunner.instance) {
      PyodideRunner.instance = new PyodideRunner();
    }
    return PyodideRunner.instance;
  }

  public getStatus(): RunnerStatus {
    return this.status;
  }

  public getLastErrorMessage(): string {
    return this.lastErrorMessage;
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    // Langsung beri tahu status terkini
    listener(this.status, this.lastErrorMessage);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(newStatus: RunnerStatus, errorMessage: string = '') {
    this.status = newStatus;
    this.lastErrorMessage = errorMessage;
    this.listeners.forEach((listener) => {
      try {
        listener(newStatus, errorMessage);
      } catch (err) {
        console.error('[PyodideRunner] Error pada status listener:', err);
      }
    });
  }

  /**
   * Inisialisasi Web Worker Pyodide (Lazy load saat komponen editor muncul)
   */
  public async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (this.status === 'ready' && this.worker) {
      return;
    }

    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    this.setStatus('loading');

    // Hentikan worker lama jika ada
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // Abaikan
      }
      this.worker = null;
    }

    try {
      this.worker = new Worker('/workers/pyodide.worker.js');

      this.worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('[PyodideRunner] Worker fatal error:', error);
        this.isInitializing = false;
        this.setStatus('error', 'Gagal memuat Pyodide dari CDN. Periksa koneksi internetmu atau coba lagi.');
      };

      // Minta worker memuat Pyodide
      this.worker.postMessage({ type: 'init' });
    } catch (err) {
      this.isInitializing = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.setStatus('error', `Gagal membuat Web Worker: ${msg}`);
    }
  }

  /**
   * Coba muat ulang Pyodide jika sebelumnya gagal
   */
  public retry(): Promise<void> {
    this.isInitializing = false;
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // Abaikan
      }
      this.worker = null;
    }
    return this.init();
  }

  /**
   * Menangani pesan yang datang dari Pyodide Web Worker
   */
  private handleWorkerMessage(data: WorkerOutMessage) {
    switch (data.type) {
      case 'status':
        if (data.status === 'loading') {
          this.setStatus('loading');
        } else if (data.status === 'ready') {
          this.isInitializing = false;
          this.setStatus('ready');
        }
        break;

      case 'ready':
        this.isInitializing = false;
        this.setStatus('ready');
        break;

      case 'init_error':
        this.isInitializing = false;
        this.setStatus('error', data.error || 'Gagal menyiapkan Pyodide dari CDN.');
        break;

      case 'result':
        if (this.activeExecutionId === data.id) {
          // Bersihkan timer timeout 5 detik
          if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
          }

          const resolve = this.activeResolve;
          this.activeExecutionId = null;
          this.activeResolve = null;

          if (data.error) {
            this.setStatus('error');
          } else {
            this.setStatus('done');
          }

          if (resolve) {
            resolve({
              id: data.id,
              stdout: data.stdout,
              stderr: data.stderr,
              error: data.error,
              truncated: data.truncated,
            });
          }
        }
        break;

      default:
        console.warn('[PyodideRunner] Pesan tidak dikenal dari worker:', data);
    }
  }

  /**
   * Eksekusi kode Python dengan hard timeout 5 detik di main thread
   */
  public async runCode(code: string): Promise<RunResult> {
    // Pastikan kode tidak kosong
    if (!code || code.trim() === '') {
      return {
        id: 'empty',
        stdout: '',
        stderr: '',
        error: {
          type: 'EmptyCode',
          message: 'Tulis kode dulu, lalu klik Jalankan.',
          line: null,
          rawTraceback: '',
        },
      };
    }

    if (this.status === 'running') {
      throw new Error('Eksekusi sebelumnya masih berjalan.');
    }

    // Pastikan worker sudah siap
    if (this.status !== 'ready' || !this.worker) {
      if (this.status === 'loading') {
        throw new Error('Pyodide masih disiapkan. Mohon tunggu beberapa detik.');
      }
      // Jika status error atau belum dibuat, coba inisialisasi
      await this.init();
      if (this.status !== 'ready') {
        throw new Error('Pyodide belum siap. Silakan klik Coba Lagi.');
      }
    }

    const executionId = Math.random().toString(36).substring(2, 9);
    this.activeExecutionId = executionId;
    this.setStatus('running');

    return new Promise<RunResult>((resolve) => {
      this.activeResolve = resolve;

      // Hard timeout 5 detik
      this.timeoutTimer = setTimeout(() => {
        this.handleTimeout(executionId);
      }, TIMEOUT_MS);

      // Kirim kode ke worker
      this.worker?.postMessage({
        type: 'run',
        id: executionId,
        code,
      });
    });
  }

  /**
   * Penanganan Hard Timeout (5 detik)
   * Terminate worker, tampilkan pesan edukatif, lalu inisialisasi worker baru secara transparan
   */
  private handleTimeout(id: string) {
    if (this.activeExecutionId !== id) return;

    console.warn(`[PyodideRunner] Eksekusi ${id} melampaui batas 5 detik. Menghentikan worker...`);

    // Hentikan worker segera
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // Abaikan
      }
      this.worker = null;
    }

    const resolve = this.activeResolve;
    this.activeExecutionId = null;
    this.activeResolve = null;
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    this.setStatus('timeout', 'Programmu berjalan terlalu lama (> 5 detik). Mungkin ada perulangan tanpa akhir (loop tak berhingga).');

    // Buat worker baru secara transparan agar tombol Run bisa langsung dipakai lagi
    this.init().catch((err) => {
      console.error('[PyodideRunner] Gagal re-inisialisasi worker setelah timeout:', err);
    });

    if (resolve) {
      const timeoutError: PythonErrorDetail = {
        type: 'Timeout',
        message: 'Programmu berjalan terlalu lama (> 5 detik). Mungkin ada perulangan tanpa akhir (looping tak berhingga).',
        line: null,
        rawTraceback: 'TimeoutError: Program running time exceeded 5 seconds limit.',
      };

      resolve({
        id,
        stdout: '',
        stderr: '',
        error: timeoutError,
      });
    }
  }
}

export const pyodideRunner = PyodideRunner.getInstance();
