'use client';

import React from 'react';
import type { BagianMateri as BagianMateriType } from '@/types/content';
import CodePlayground from '@/components/editor/CodePlayground';
import KotakCatatan from './KotakCatatan';

export interface BagianMateriProps {
  bagian: BagianMateriType;
  nomorBagian: number;
  totalBagian: number;
  isRead: boolean;
  onToggleRead: () => void;
  className?: string;
}

/**
 * Komponen Bagian Materi (Single Responsibility).
 * Menampilkan struktur lengkap satu topik:
 * Penjelasan -> Analogi -> Contoh Kode Runnable -> Output Pembanding ->
 * Penjelasan Per Baris -> Kesalahan Umum -> Coba Sendiri.
 */
export default function BagianMateri({
  bagian,
  nomorBagian,
  totalBagian,
  isRead,
  onToggleRead,
  className = '',
}: BagianMateriProps) {
  return (
    <article
      id={bagian.id}
      className={`scroll-mt-24 space-y-6 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-xs transition-colors ${
        isRead ? 'ring-2 ring-emerald-500/20 border-emerald-300/60' : ''
      } ${className}`}
      aria-labelledby={`heading-${bagian.id}`}
    >
      {/* 1. Header Bagian & Tombol Penanda Selesai Dibaca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              Bagian {nomorBagian} dari {totalBagian}
            </span>
            {isRead && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                <span aria-hidden="true">✓</span> Sudah Dibaca
              </span>
            )}
          </div>
          <h3
            id={`heading-${bagian.id}`}
            className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
          >
            {bagian.judul}
          </h3>
        </div>

        {/* Tombol Toggle Penanda Bacaan (Stateful) */}
        <button
          type="button"
          onClick={onToggleRead}
          aria-pressed={isRead}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all min-h-[44px] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isRead
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
          }`}
          title={isRead ? 'Klik untuk membatalkan tanda' : 'Tandai bagian ini telah selesai kamu baca'}
        >
          <span className="text-base" aria-hidden="true">
            {isRead ? '✅' : '📖'}
          </span>
          <span>{isRead ? 'Selesai Dibaca' : 'Tandai Selesai Dibaca'}</span>
        </button>
      </div>

      {/* 2. Penjelasan Konsep Utama */}
      <div className="prose prose-slate max-w-none">
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
          {bagian.penjelasan}
        </p>
      </div>

      {/* 3. Analogi Dunia Nyata (Siswa SMK) */}
      {bagian.analogi && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-sky-200/90 bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-indigo-50/30 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-200/80 text-sky-900 text-xl shadow-2xs"
              aria-hidden="true"
            >
              💡
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-900">
                  Analogi Kontekstual SMK
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {bagian.analogi}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Contoh Kode Interaktif & Output Pembanding (CodePlayground dari Tahap 2) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            🧪 Coba Langsung Kode di Bawah:
          </span>
          <span className="text-xs text-slate-400">
            Ketik bebas atau klik Jalankan
          </span>
        </div>

        <CodePlayground
          initialCode={bagian.contoh_kode}
          expectedOutput={bagian.output_contoh}
          title={`Contoh Kode: ${bagian.judul}`}
          subtitle="Jalankan kode ini langsung atau coba ubah teks di dalamnya untuk bereksperimen"
        />
      </div>

      {/* 5. Penjelasan Kode Per Baris */}
      {bagian.penjelasan_kode && bagian.penjelasan_kode.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base" aria-hidden="true">🔍</span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Penjelasan Kode Baris demi Baris:
            </h4>
          </div>

          <ul className="space-y-2.5">
            {bagian.penjelasan_kode.map((item, index) => (
              <li
                key={index}
                className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white p-3 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs font-normal"
              >
                <div className="flex items-start gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-600 mt-0.5"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="break-words">{item}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Catatan Kesalahan Umum (Gaya visual mencolok namun ramah pemula) */}
      {bagian.catatan_umum_salah && (
        <KotakCatatan pesan={bagian.catatan_umum_salah} />
      )}

      {/* 7. Tantangan Coba Sendiri */}
      {bagian.coba_sendiri && (
        <div className="rounded-2xl border border-violet-200/90 bg-violet-50/40 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800 text-lg shadow-2xs"
              aria-hidden="true"
            >
              🎯
            </span>
            <div className="flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-violet-900 mb-1">
                Tantangan Eksperimen:
              </span>
              <p className="text-xs sm:text-sm text-violet-950 font-medium leading-relaxed">
                {bagian.coba_sendiri}
              </p>
              <p className="mt-2 text-[11px] text-violet-700">
                👉 Ubah kode di editor pada bagian atas, lalu klik <strong>Jalankan</strong>!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tombol Aksi Penanda di Bagian Bawah */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onToggleRead}
          aria-pressed={isRead}
          className={`inline-flex items-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
            isRead
              ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <span>{isRead ? '✓ Kamu sudah membaca bagian ini' : 'Selesai membaca? Tandai sudah dibaca &rarr;'}</span>
        </button>
      </div>
    </article>
  );
}
