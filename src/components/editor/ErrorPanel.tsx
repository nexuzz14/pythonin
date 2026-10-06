'use client';

import React from 'react';
import type { FriendlyError } from '@/types/runner';

interface ErrorPanelProps {
  error: FriendlyError;
  className?: string;
}

export default function ErrorPanel({ error, className = '' }: ErrorPanelProps) {
  return (
    <div
      className={`rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-slate-800 shadow-xs ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Header Error Ramah */}
      <div className="flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-sm shadow-xs"
          aria-hidden="true"
        >
          ✕
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-rose-900">
              {error.title}
            </h4>
            {error.line !== null && (
              <span className="rounded-md bg-rose-200/80 px-2 py-0.5 text-xs font-semibold text-rose-800">
                Baris {error.line}
              </span>
            )}
            <span className="rounded-md bg-white border border-rose-200 px-2 py-0.5 text-[11px] font-mono text-rose-700">
              {error.type}
            </span>
          </div>

          <p className="mt-1.5 text-xs sm:text-sm text-rose-800 leading-relaxed">
            {error.message}
          </p>

          {/* Saran Perbaikan Edukatif */}
          {error.suggestion && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-white p-3 text-xs sm:text-sm text-slate-700">
              <span className="font-bold text-rose-900 block mb-1">
                💡 Saran Perbaikan:
              </span>
              <span>{error.suggestion}</span>
            </div>
          )}

          {/* Traceback Teknis Asli (Dapat Dilipat / Details-Summary) */}
          {error.rawTraceback && (
            <details className="mt-3 group">
              <summary className="cursor-pointer text-xs font-semibold text-rose-700 hover:text-rose-900 transition select-none flex items-center gap-1.5">
                <span className="transition-transform group-open:rotate-90">▶</span>
                <span>Lihat pesan teknis asli (Traceback)</span>
              </summary>
              <div className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-rose-200 border border-slate-800">
                <pre className="whitespace-pre-wrap break-words">
                  {error.rawTraceback}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
