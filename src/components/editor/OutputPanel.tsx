'use client';

import React from 'react';

interface OutputPanelProps {
  stdout: string;
  onClear?: () => void;
  isRunning?: boolean;
  truncated?: boolean;
  className?: string;
}

export default function OutputPanel({
  stdout,
  onClear,
  isRunning = false,
  truncated = false,
  className = '',
}: OutputPanelProps) {
  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden ${className}`}>
      {/* Header Panel Output */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Output Program
          </span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 animate-pulse font-medium">
              <span>●</span> Menjalankan...
            </span>
          )}
        </div>

        {stdout && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer min-h-[44px]"
            title="Bersihkan teks output"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Konten Output - Teks Murni (Mencegah XSS, tanpa dangerouslySetInnerHTML) */}
      <div
        className="max-h-64 min-h-[96px] overflow-y-auto p-4 font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 leading-relaxed"
        aria-live="polite"
        aria-atomic="true"
        role="region"
        aria-label="Hasil eksekusi program"
      >
        {stdout ? (
          <pre className="whitespace-pre-wrap break-words font-mono">
            {stdout}
          </pre>
        ) : (
          <p className="text-slate-400 italic text-xs sm:text-sm">
            {isRunning
              ? 'Sedang menjalankan program...'
              : 'Hasil cetak program (print) akan tampil di sini setelah kamu klik Jalankan.'}
          </p>
        )}

        {truncated && (
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/60 p-2 text-xs text-amber-200">
            ⚠️ Catatan: Output dipotong karena terlalu panjang (melebihi batas wajar).
          </div>
        )}
      </div>
    </div>
  );
}
