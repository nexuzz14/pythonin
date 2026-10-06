'use client';

import React, { useEffect } from 'react';
import type { RunnerStatus } from '@/types/runner';

interface RunControlsProps {
  status: RunnerStatus;
  onRun: () => void;
  onReset: () => void;
  onCopy: () => void;
  isCopied?: boolean;
  className?: string;
}

export default function RunControls({
  status,
  onRun,
  onReset,
  onCopy,
  isCopied = false,
  className = '',
}: RunControlsProps) {
  const isRunning = status === 'running';
  const isLoading = status === 'loading';
  const isRunDisabled = isRunning || isLoading;

  // Shortcut Ctrl+Enter / Cmd+Enter untuk menjalankan kode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunDisabled) {
          onRun();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRun, isRunDisabled]);

  // Render teks dan ikon status informatif
  const renderStatusBadge = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <span className="animate-spin text-sm">⏳</span>
            <span>Memuat Python...</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 animate-pulse">
            <span className="text-sm">⚙️</span>
            <span>Sedang berjalan...</span>
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="text-sm">✅</span>
            <span>Selesai dijalankan</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
            <span className="text-sm">⚠️</span>
            <span>Terjadi error</span>
          </span>
        );
      case 'timeout':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            <span className="text-sm">⏱️</span>
            <span>Waktu habis (&gt; 5 detik)</span>
          </span>
        );
      case 'ready':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Python Siap</span>
          </span>
        );
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 ${className}`}>
      {/* Kelompok Tombol Aksi Kiri */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tombol Jalankan / Run */}
        <button
          type="button"
          onClick={onRun}
          disabled={isRunDisabled}
          aria-label="Jalankan kode Python (Ctrl+Enter)"
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl font-bold text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
            isRunDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          <span className="text-base" aria-hidden="true">
            {isRunning ? '⏳' : '▶'}
          </span>
          <span>{isRunning ? 'Menjalankan...' : 'Jalankan'}</span>
          <span className="hidden sm:inline-block text-[11px] font-normal opacity-80 bg-blue-700/50 px-1.5 py-0.5 rounded">
            Ctrl+↵
          </span>
        </button>

        {/* Tombol Reset ke Kode Awal */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          aria-label="Reset kode ke kondisi awal"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <span aria-hidden="true">↺</span>
          <span>Reset</span>
        </button>

        {/* Tombol Salin Kode */}
        <button
          type="button"
          onClick={onCopy}
          aria-label="Salin kode ke papan klip"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <span aria-hidden="true">{isCopied ? '✓' : '📋'}</span>
          <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
        </button>
      </div>

      {/* Indikator Status Kanan */}
      <div className="flex items-center py-1">
        {renderStatusBadge()}
      </div>
    </div>
  );
}
