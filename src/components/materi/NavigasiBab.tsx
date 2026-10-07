import React from 'react';
import Link from 'next/link';

export interface NavigasiBabProps {
  currentBab: number;
  totalBab?: number;
  className?: string;
}

/**
 * Komponen Navigasi Antar-Bab (Single Responsibility).
 * Menyediakan tombol "Bab sebelumnya", "Bab berikutnya", dan tombol menuju Kuis Bab tersebut.
 */
export default function NavigasiBab({
  currentBab,
  totalBab = 5,
  className = '',
}: NavigasiBabProps) {
  const hasPrev = currentBab > 1;
  const hasNext = currentBab < totalBab;

  return (
    <nav
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs ${className}`}
      aria-label="Navigasi Materi dan Kuis"
    >
      <div className="flex flex-col gap-4">
        {/* Tombol Utama Kuis Bab */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Evaluasi Pemahaman
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-white">
              Siap Uji Pemahaman Misi {currentBab}?
            </h4>
            <p className="text-xs text-blue-100 mt-0.5">
              Kerjakan kuis 5 soal interaktif untuk menguji penguasaan materimu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/latihan?bab=${currentBab}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-700/80 hover:bg-blue-800 text-white border border-blue-400/80 px-4 py-2.5 text-xs sm:text-sm font-bold transition min-h-[44px] shrink-0"
            >
              <span>🧩 Tantangan Misi {currentBab}</span>
            </Link>

            <Link
              href={`/kuis/${currentBab}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-[0.98] min-h-[44px] shrink-0"
            >
              <span>Mulai Kuis &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Tombol Bab Sebelumnya dan Berikutnya */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Sisi Kiri: Bab Sebelumnya atau Daftar Materi */}
          {hasPrev ? (
            <Link
              href={`/materi/${currentBab - 1}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px]"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Bab Sebelumnya (Misi {currentBab - 1})</span>
            </Link>
          ) : (
            <Link
              href="/materi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px]"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Daftar Materi</span>
            </Link>
          )}

          {/* Sisi Kanan: Bab Berikutnya */}
          {hasNext ? (
            <Link
              href={`/materi/${currentBab + 1}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition min-h-[44px]"
            >
              <span>Bab Berikutnya (Misi {currentBab + 1})</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <Link
              href="/progress"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition min-h-[44px]"
            >
              <span>🎉 Lihat Semua Progress Belajar</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
