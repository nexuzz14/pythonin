import React from 'react';
import Link from 'next/link';

export interface MateriErrorViewProps {
  status: 'file-not-found' | 'corrupt';
  babNumber: number;
  filename: string;
  errorMessage: string;
}

/**
 * Komponen Tampilan Error Ramah (Single Responsibility).
 * Ditampilkan saat file JSON materi tidak ditemukan atau isinya rusak,
 * mencegah aplikasi crash atau menampilkan layar putih fatal.
 */
export default function MateriErrorView({
  status,
  babNumber,
  filename,
  errorMessage,
}: MateriErrorViewProps) {
  const isCorrupt = status === 'corrupt';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div
        className="rounded-3xl border border-rose-200 bg-white p-6 sm:p-10 shadow-sm text-center"
        role="alert"
        aria-live="assertive"
      >
        {/* Ikon Peringatan Ramah */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-3xl text-rose-600 shadow-2xs mb-4">
          ⚠️
        </div>

        <span className="inline-block rounded-md bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 mb-2">
          {isCorrupt ? 'Format Konten Rusak' : 'File Materi Tidak Ditemukan'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Oops! Materi Misi {babNumber} Belum Dapat Dimuat
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          {isCorrupt
            ? 'Terjadi kendala saat membaca data berkas materi ini karena format JSON tidak valid atau struktur datanya rusak. Jangan khawatir, sistem aplikasi tetap berjalan normal.'
            : `File konten "${filename}" belum tersedia di sistem penyimpanan materi.`}
        </p>

        {/* Kotak Rincian Diagnostik yang Ramah */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left max-w-xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <span>🛠️</span>
            <span>Rincian Diagnostik:</span>
          </div>
          <p className="font-mono text-xs text-rose-700 bg-rose-50/80 p-2.5 rounded-lg border border-rose-200/60 break-words">
            {errorMessage}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Berkas target: <code className="font-mono text-slate-700 font-semibold">{filename}</code>
          </p>
        </div>

        {/* Tombol Aksi Navigasi Pemulihan */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/materi"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition min-h-[44px] flex items-center"
          >
            &larr; Kembali ke Daftar Materi
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px] flex items-center"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
