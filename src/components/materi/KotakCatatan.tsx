'use client';

import React from 'react';

export interface KotakCatatanProps {
  pesan: string;
  judul?: string;
  className?: string;
}

/**
 * Komponen Catatan Kesalahan Umum (Single Responsibility).
 * Memiliki gaya visual mencolok (warna amber hangat) agar menarik perhatian siswa,
 * namun tetap ramah dan suportif (tidak menggunakan warna merah alarm yang menakutkan).
 */
export default function KotakCatatan({
  pesan,
  judul = 'Waspadai Kesalahan Ini',
  className = '',
}: KotakCatatanProps) {
  if (!pesan) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-50 via-amber-50/70 to-orange-50/50 p-4 sm:p-5 shadow-xs ${className}`}
      role="note"
      aria-label="Catatan kesalahan umum"
    >
      {/* Aksen visual lembut di latar belakang */}
      <div
        className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-amber-200/40 blur-xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-3">
        {/* Ikon Perhatian Ramah */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/90 text-amber-900 text-lg shadow-2xs"
          aria-hidden="true"
        >
          ⚠️
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="rounded-md bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
              Kesalahan Umum
            </span>
            <h4 className="text-sm sm:text-base font-bold text-amber-950">
              {judul}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-normal">
            {pesan}
          </p>

          <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-[11px] font-medium text-amber-800">
            <span>💡</span>
            <span>Tip: Error saat belajar itu wajar dan justru membuatmu makin paham!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
