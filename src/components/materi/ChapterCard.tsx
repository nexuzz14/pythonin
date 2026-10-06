'use client';

import React from 'react';
import Link from 'next/link';
import type { BabSummary } from '@/types/content';
import { useReadSections } from '@/lib/read-progress';

export interface ChapterCardProps {
  bab: BabSummary;
  className?: string;
}

export type BabProgressStatus = 'belum' | 'sedang' | 'selesai';

/**
 * Komponen Kartu Bab Materi (Single Responsibility).
 * Menampilkan ringkasan bab, estimasi durasi belajar, dan status progress siswa secara real-time.
 */
export default function ChapterCard({ bab, className = '' }: ChapterCardProps) {
  const { count: readSectionsCount } = useReadSections(bab.nomor);

  const status: BabProgressStatus =
    readSectionsCount >= 4
      ? 'selesai'
      : readSectionsCount > 0
      ? 'sedang'
      : 'belum';

  const renderProgressBadge = () => {
    switch (status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <span aria-hidden="true">✅</span> Selesai
          </span>
        );
      case 'sedang':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <span aria-hidden="true">⏳</span> Sedang Dipelajari ({readSectionsCount}/4)
          </span>
        );
      case 'belum':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Belum Mulai
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-blue-400 hover:shadow-md ${className}`}
    >
      <div>
        {/* Header Kartu: Misi, Durasi, dan Status Progress */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-800">
              Misi {bab.nomor}
            </span>
            <span className="text-xs font-medium text-slate-500">
              ⏱️ ± {bab.durasi_menit} menit
            </span>
          </div>

          <div>{renderProgressBadge()}</div>
        </div>

        {/* Judul Bab */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          <Link href={`/materi/${bab.nomor}`} className="focus:outline-none">
            {bab.judul}
          </Link>
        </h2>

        {/* Ringkasan Bab */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
          {bab.ringkasan}
        </p>

        {/* Tujuan Ringkas */}
        {bab.tujuan && bab.tujuan.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              🎯 Fokus Pembelajaran:
            </span>
            <ul className="space-y-1">
              {bab.tujuan.slice(0, 2).map((t, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-slate-700 leading-normal"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="line-clamp-1">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/kuis/${bab.nomor}`}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition min-h-[36px] flex items-center gap-1"
        >
          <span>🎯 Kuis Misi {bab.nomor}</span>
        </Link>

        <Link
          href={`/materi/${bab.nomor}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition min-h-[44px]"
        >
          <span>{status === 'sedang' ? 'Lanjutkan Belajar' : 'Buka Materi'}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
