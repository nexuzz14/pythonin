'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SymbolBar from './SymbolBar';
import RunControls from './RunControls';
import OutputPanel from './OutputPanel';
import ErrorPanel from './ErrorPanel';
import { pyodideRunner } from '@/lib/pyodide/runner';
import { formatFriendlyError } from '@/lib/error-friendly';
import type { FriendlyError, RunnerStatus } from '@/types/runner';

// CodeEditor dimuat secara dinamis dengan SSR nonaktif agar tidak masuk bundle halaman lain
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-56 w-full rounded-xl border border-slate-700/80 bg-slate-900 overflow-hidden font-mono text-xs shadow-inner">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700 animate-pulse" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700 animate-pulse" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700 animate-pulse" />
        <span className="ml-2 text-slate-500 font-sans text-xs">Menyiapkan editor...</span>
      </div>
      <div className="flex-1 p-4 space-y-2.5 animate-shimmer">
        <div className="h-3 w-3/4 rounded bg-slate-800/80" />
        <div className="h-3 w-1/2 rounded bg-slate-800/60" />
        <div className="h-3 w-2/3 rounded bg-slate-800/70" />
      </div>
    </div>
  ),
});

export interface CodePlaygroundProps {
  initialCode: string;
  readOnly?: boolean;
  expectedOutput?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function CodePlayground({
  initialCode,
  readOnly = false,
  expectedOutput,
  className = '',
  title,
  subtitle,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [stdout, setStdout] = useState('');
  const [friendlyError, setFriendlyError] = useState<FriendlyError | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus>('loading');
  const [runnerError, setRunnerError] = useState<string>('');
  const [thisStatus, setThisStatus] = useState<'idle' | 'running' | 'done' | 'error' | 'timeout'>('idle');

  const insertSymbolRef = useRef<((symbol: string) => void) | null>(null);

  // Inisialisasi Lazy Pyodide saat playground pertama kali dimount
  useEffect(() => {
    const unsubscribe = pyodideRunner.subscribe((status, errorMessage) => {
      setRunnerStatus(status);
      if (errorMessage) {
        setRunnerError(errorMessage);
      }
    });

    pyodideRunner.init();

    return () => {
      unsubscribe();
    };
  }, []);

  // Handler Jalankan Kode
  const handleRun = async () => {
    setStdout('');
    setFriendlyError(null);
    setIsTruncated(false);
    setThisStatus('running');

    try {
      const result = await pyodideRunner.runCode(code);

      setStdout(result.stdout || '');
      setIsTruncated(!!result.truncated);

      if (result.error) {
        const parsed = formatFriendlyError(result.error, code);
        setFriendlyError(parsed);
        setThisStatus(result.error.type === 'Timeout' ? 'timeout' : 'error');
      } else {
        setThisStatus('done');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFriendlyError(formatFriendlyError(msg, code));
      setThisStatus('error');
    }
  };

  // Handler Reset Kode ke initialCode
  const handleReset = () => {
    setCode(initialCode);
    setStdout('');
    setFriendlyError(null);
    setIsTruncated(false);
    setThisStatus('idle');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (thisStatus === 'done' || thisStatus === 'error') {
      setThisStatus('idle');
    }
  };

  // Handler Salin Kode
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  // Handler Sisipkan Simbol dari SymbolBar
  const handleInsertSymbol = (symbol: string) => {
    if (insertSymbolRef.current) {
      insertSymbolRef.current(symbol);
    } else {
      setCode((prev) => prev + symbol);
    }
  };

  const effectiveStatus: RunnerStatus =
    runnerStatus === 'loading'
      ? 'loading'
      : runnerStatus === 'error'
      ? 'error'
      : thisStatus === 'running'
      ? 'running'
      : runnerStatus === 'running'
      ? 'running'
      : thisStatus === 'done'
      ? 'done'
      : thisStatus === 'error'
      ? 'error'
      : thisStatus === 'timeout'
      ? 'timeout'
      : 'ready';

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm ${className}`}>
      {/* Header Playground (Opsional) */}
      {(title || subtitle) && (
        <div className="border-b border-slate-100 pb-3">
          {title && <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Banner Peringatan jika CDN Gagal Dimuat */}
      {runnerStatus === 'error' && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900" role="alert">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Gagal Menyiapkan Python</span>
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-rose-800">
                {runnerError || 'Tidak dapat mengunduh pustaka Pyodide dari CDN. Periksa koneksi internetmu atau izin akses browser.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => pyodideRunner.retry()}
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 min-h-[44px]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Bilah Simbol Mobile (Khusus layar <= 768px) */}
      <SymbolBar onInsert={handleInsertSymbol} />

      {/* Editor Kode CodeMirror 6 */}
      <CodeEditor
        initialCode={code}
        onChange={handleCodeChange}
        readOnly={readOnly}
        onInsertSymbolRef={insertSymbolRef}
      />

      {/* Kontrol Run, Reset, Salin */}
      <RunControls
        status={effectiveStatus}
        onRun={handleRun}
        onReset={handleReset}
        onCopy={handleCopy}
        isCopied={isCopied}
      />

      {/* Panel Error Ramah Pemula */}
      {friendlyError && <ErrorPanel error={friendlyError} />}

      {/* Panel Output */}
      <OutputPanel
        stdout={stdout}
        isRunning={thisStatus === 'running'}
        truncated={isTruncated}
        onClear={() => setStdout('')}
      />

      {/* Target Output Pembanding (Jika Disediakan) */}
      {expectedOutput && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">
            <span>🎯</span>
            <span>Target Output yang Diharapkan:</span>
          </div>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-blue-950 bg-white/80 p-2.5 rounded-lg border border-blue-200/60">
            {expectedOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
