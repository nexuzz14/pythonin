/**
 * Web Worker Klasik untuk Eksekusi Python via Pyodide
 * Versi Pyodide: v0.27.8 (Dipin eksplisit dari CDN jsDelivr)
 * Sumber: https://cdn.jsdelivr.net/pyodide/v0.27.8/full/pyodide.js
 */

/* global importScripts, loadPyodide, postMessage */

let pyodideInstance = null;
let isInitializing = false;

// Batasan Output Wajar
const MAX_OUTPUT_CHARS = 20000;
const MAX_OUTPUT_LINES = 1000;

/**
 * Buffer Pengumpul Output (stdout & stderr)
 */
let stdoutBuffer = [];
let stderrBuffer = [];
let outputCharCount = 0;
let outputLineCount = 0;
let outputTruncated = false;

function resetBuffers() {
  stdoutBuffer = [];
  stderrBuffer = [];
  outputCharCount = 0;
  outputLineCount = 0;
  outputTruncated = false;
}

function appendStdout(text) {
  if (outputTruncated) return;

  const lines = text.split('\n');
  outputLineCount += lines.length - 1;
  outputCharCount += text.length;

  if (outputCharCount > MAX_OUTPUT_CHARS || outputLineCount > MAX_OUTPUT_LINES) {
    outputTruncated = true;
    stdoutBuffer.push(text);
    return;
  }

  stdoutBuffer.push(text);
}

function appendStderr(text) {
  if (outputTruncated) return;
  stderrBuffer.push(text);
}

/**
 * Parsing Traceback Python untuk mengekstrak tipe error, pesan, dan nomor baris relatif
 */
function extractPythonError(rawErrorString) {
  let errorType = 'Error';
  let errorMessage = rawErrorString;
  let errorLine = null;

  // Pola nomor baris: File "<exec>", line X atau File "<string>", line X
  const lineMatch = rawErrorString.match(/File\s+["']<(?:exec|string)>["'],\s+line\s+(\d+)/i);
  if (lineMatch && lineMatch[1]) {
    errorLine = parseInt(lineMatch[1], 10);
  }

  // Pola baris terakhir traceback: TypeName: Message
  const lines = rawErrorString.trim().split('\n');
  const lastLine = lines[lines.length - 1] || '';
  const typeMatch = lastLine.match(/^([A-Za-z_][A-Za-z0-9_]*Error|[A-Za-z_][A-Za-z0-9_]*Exception):\s*(.*)$/);

  if (typeMatch) {
    errorType = typeMatch[1];
    errorMessage = typeMatch[2] || '';
  } else if (lastLine.includes(':')) {
    const parts = lastLine.split(':');
    errorType = parts[0].trim();
    errorMessage = parts.slice(1).join(':').trim();
  }

  return {
    type: errorType,
    message: errorMessage,
    line: errorLine,
    rawTraceback: rawErrorString,
  };
}

/**
 * Inisialisasi Pyodide
 */
async function initPyodide() {
  if (pyodideInstance) {
    postMessage({ type: 'ready' });
    return;
  }

  if (isInitializing) return;
  isInitializing = true;

  try {
    postMessage({ type: 'status', status: 'loading' });

    // Memuat skrip Pyodide secara klasik
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.8/full/pyodide.js');

    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.8/full/',
      stdout: (text) => appendStdout(text + '\n'),
      stderr: (text) => appendStderr(text + '\n'),
    });

    // Setup input() simulasi di environment Python
    pyodideInstance.runPython(`
import builtins

def _simulated_input(*args, **kwargs):
    raise EOFError("input() tidak didukung di media ini. Masukan program disimulasikan melalui variabel di baris awal kode (contoh: nama = 'Budi').")

builtins.input = _simulated_input
`);

    isInitializing = false;
    postMessage({ type: 'ready' });
  } catch (err) {
    isInitializing = false;
    postMessage({
      type: 'init_error',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Menjalankan Kode Siswa dalam Namespace Bersih
 */
async function executeCode(id, code) {
  if (!pyodideInstance) {
    postMessage({
      type: 'init_error',
      error: 'Pyodide belum siap digunakan.',
    });
    return;
  }

  resetBuffers();

  let pyError = null;
  let customGlobals = null;

  try {
    // Siapkan namespace (dict) bersih untuk eksekusi terisolasi
    customGlobals = pyodideInstance.runPython('dict()');

    // Jalankan kode siswa
    pyodideInstance.runPython(code, { globals: customGlobals });
  } catch (err) {
    const rawError = err instanceof Error ? err.message : String(err);
    pyError = extractPythonError(rawError);
  } finally {
    if (customGlobals && typeof customGlobals.destroy === 'function') {
      try {
        customGlobals.destroy();
      } catch {
        // Abaikan jika pembersihan globals gagal
      }
    }
  }

  let finalStdout = stdoutBuffer.join('');
  let finalStderr = stderrBuffer.join('');

  if (outputTruncated) {
    if (finalStdout.length > MAX_OUTPUT_CHARS) {
      finalStdout = finalStdout.slice(0, MAX_OUTPUT_CHARS);
    }
    finalStdout += '\n[Output dipotong karena terlalu panjang (maksimal 20.000 karakter atau 1.000 baris)]';
  }

  postMessage({
    type: 'result',
    id,
    stdout: finalStdout,
    stderr: finalStderr,
    error: pyError || undefined,
    truncated: outputTruncated,
  });
}

/**
 * Event Listener Pesan Worker
 */
self.onmessage = async function (e) {
  const data = e.data;
  if (!data || !data.type) return;

  switch (data.type) {
    case 'init':
      await initPyodide();
      break;

    case 'run':
      await executeCode(data.id, data.code);
      break;

    default:
      console.warn('[Pyodide Worker] Pesan tidak dikenal:', data.type);
  }
};
