'use client';

import React, { useState } from 'react';

interface KuisCodeBlockProps {
  code: string;
}

/**
 * Komponen Blok Kode Soal Kuis (Kebutuhan 3).
 * Menampilkan kode Python read-only yang rapi,
 * dapat discroll secara horizontal di layar ponsel (lebar 360px),
 * serta dilengkapi tombol salin kode untuk kenyamanan siswa.
 */
export default function KuisCodeBlock({ code }: KuisCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Abaikan jika tidak didukung di peramban tertentu
    }
  };

  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-slate-900 shadow-md overflow-hidden">
      {/* Header Bar Blok Kode */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-1 font-mono font-semibold text-slate-300">Python 3</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Kode tersalin ke clipboard' : 'Salin kode cuplikan'}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {copied ? (
            <>
              <span className="text-emerald-400">✓</span>
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Konten Kode yang Dapat Discroll Horizontal di Ponsel */}
      <div className="relative">
        <pre className="overflow-x-auto p-4 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre tab-4 select-text">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
