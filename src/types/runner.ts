/**
 * Protokol Pesan dan Tipe State Eksekusi Runner Python (Pyodide Worker)
 */

export type RunnerStatus =
  | 'idle'      // Belum ada aktivitas, worker belum diinisialisasi
  | 'loading'   // Sedang mengunduh / menginisialisasi Pyodide dari CDN
  | 'ready'     // Pyodide siap menerima kode untuk dieksekusi
  | 'running'   // Kode sedang dijalankan di Web Worker
  | 'done'      // Eksekusi kode selesai dengan sukses
  | 'error'     // Eksekusi kode menghasilkan error Python
  | 'timeout';  // Eksekusi melebihi batas waktu (5 detik)

export interface PythonErrorDetail {
  type: string;
  message: string;
  line: number | null;
  rawTraceback: string;
}

export interface FriendlyError {
  type: string;
  title: string;
  message: string;
  suggestion: string;
  line: number | null;
  rawTraceback: string;
}

export interface RunResult {
  id: string;
  stdout: string;
  stderr: string;
  error?: PythonErrorDetail;
  truncated?: boolean;
}

// Pesan dari Main Thread -> Worker
export type WorkerInMessage =
  | { type: 'init' }
  | { type: 'run'; id: string; code: string };

// Pesan dari Worker -> Main Thread
export type WorkerOutMessage =
  | { type: 'status'; status: 'loading' | 'ready' }
  | { type: 'ready' }
  | { type: 'result'; id: string; stdout: string; stderr: string; error?: PythonErrorDetail; truncated?: boolean }
  | { type: 'init_error'; error: string };
