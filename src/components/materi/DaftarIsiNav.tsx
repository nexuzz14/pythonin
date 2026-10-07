'use client';

import React, { useState } from 'react';
import type { BagianMateri } from '@/types/content';

export interface DaftarIsiNavProps {
  bagianList: BagianMateri[];
  readSections: Set<string>;
  className?: string;
}

/**
 * Komponen Daftar Isi Bab & Indikator Kemajuan (Single Responsibility).
 * Memungkinkan siswa melompat ke bagian tertentu dan memantau bagian yang sudah dibaca.
 */
export default function DaftarIsiNav({
  bagianList,
  readSections,
  className = '',
}: DaftarIsiNavProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const totalBagian = bagianList.length;
  const readCount = bagianList.filter((b) => readSections.has(b.id)).length;
  const progressPercent = Math.round((readCount / totalBagian) * 100);

  const scrollToAnchor = (id: string) => {
    setIsOpenMobile(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs ${className}`}
      aria-label="Daftar Isi Bab"
    >
      {/* Header Daftar Isi dengan Bilah Progres */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">📑</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Daftar Isi Misi
            </span>
          </div>

          {/* Tombol Buka/Tutup di Layar Mobile */}
          <button
            type="button"
            onClick={() => setIsOpenMobile((prev) => !prev)}
            aria-expanded={isOpenMobile}
            className="md:hidden text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            {isOpenMobile ? 'Tutup Daftar Isi ▲' : 'Buka Daftar Isi ▼'}
          </button>
        </div>

        {/* Indikator Progres Bacaan Bab */}
        <div className="space-y-1.5 border-y border-slate-100 py-2.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Progres Membaca:</span>
            <span className="font-bold text-slate-800">
              {readCount} / {totalBagian} Bagian ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Daftar Link Loncat ke Bagian */}
      <div
        className={`${
          isOpenMobile ? 'block' : 'hidden'
        } md:block mt-3 space-y-1.5`}
      >
        {bagianList.map((bag, index) => {
          const isRead = readSections.has(bag.id);

          return (
            <button
              key={bag.id}
              type="button"
              onClick={() => scrollToAnchor(bag.id)}
              className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] ${
                isRead
                  ? 'bg-emerald-50/70 text-emerald-900 font-medium hover:bg-emerald-100/70'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="shrink-0 text-slate-400 font-mono text-xs mt-0.5">
                  #{index + 1}
                </span>
                <span className="leading-snug">{bag.judul}</span>
              </div>

              <span
                className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  isRead
                    ? 'bg-emerald-500 text-white'
                    : 'border border-slate-300 text-transparent'
                }`}
                aria-label={isRead ? 'Sudah dibaca' : 'Belum dibaca'}
              >
                ✓
              </span>
            </button>
          );
        })}

        {/* Tautan Navigasi Ekstra: Latihan, Poin Penting, Istilah */}
        <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => scrollToAnchor('latihan-editor')}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer min-h-[44px]"
          >
            <span className="text-base">💻</span>
            <span>Latihan Editor Mandiri</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor('poin-penting')}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer min-h-[44px]"
          >
            <span className="text-base">📌</span>
            <span>Poin Penting</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor('daftar-istilah')}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer min-h-[44px]"
          >
            <span className="text-base">📖</span>
            <span>Glosarium Istilah</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
