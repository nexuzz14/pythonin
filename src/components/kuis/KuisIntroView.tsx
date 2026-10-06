'use client';

import React from 'react';
import Link from 'next/link';
import type { KuisBab } from '@/types/content';

interface KuisIntroViewProps {
  kuisData: KuisBab;
  babNumber: number;
  acakOpsi: boolean;
  onToggleAcakOpsi: (checked: boolean) => void;
  onMulai: () => void;
}

/**
 * Layar Pembuka Kuis (Kebutuhan 2 & 4).
 * Menyajikan judul kuis, jumlah soal, distribusi kesulitan,
 * aturan pengerjaan, info petunjuk, dan tombol mulai.
 */
export default function KuisIntroView({
  kuisData,
  babNumber,
  acakOpsi,
  onToggleAcakOpsi,
  onMulai,
}: KuisIntroViewProps) {
  const totalSoal = kuisData.soal.length;

  // Hitung sebaran tingkat kesulitan
  const kesulitanCounts = kuisData.soal.reduce(
    (acc, s) => {
      acc[s.tingkat] = (acc[s.tingkat] || 0) + 1;
      return acc;
    },
    { mudah: 0, sedang: 0, sulit: 0 } as Record<string, number>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Breadcrumb Navigasi */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href={`/materi/${babNumber}`} className="hover:text-blue-600 transition-colors">
          Misi {babNumber}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Kuis Pemahaman</span>
      </nav>

      {/* Kartu Utama Layar Pembuka */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        {/* Lencana Identitas */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            <span>🎯</span>
            <span>Misi {babNumber}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <span>📝</span>
            <span>{totalSoal} Soal Pilihan Ganda</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <span>⏱️</span>
            <span>Estimasi ~5-10 Menit</span>
          </span>
        </div>

        {/* Judul & Pengantar */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {kuisData.judul_kuis}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Uji pemahaman teoritis dan penalaran kodemu setelah mempelajari materi Misi {babNumber}.
          Kamu akan langsung mendapatkan umpan balik serta pembahasan detail setelah menjawab setiap soal.
        </p>

        {/* Ringkasan Distribusi Kesulitan Soal */}
        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-4 sm:p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Komposisi Tingkat Kesulitan
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3">
              <span className="text-xs font-bold text-emerald-800 block">Mudah</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700">
                {kesulitanCounts.mudah || 0} Soal
              </span>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3">
              <span className="text-xs font-bold text-amber-800 block">Sedang</span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-700">
                {kesulitanCounts.sedang || 0} Soal
              </span>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3">
              <span className="text-xs font-bold text-rose-800 block">Sulit</span>
              <span className="text-lg sm:text-xl font-extrabold text-rose-700">
                {kesulitanCounts.sulit || 0} Soal
              </span>
            </div>
          </div>
        </div>

        {/* Petunjuk & Panduan Kuis */}
        <div className="mt-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Petunjuk & Aturan Pengerjaan
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="text-blue-600 text-base leading-none">✓</span>
              <span>
                <strong>Satu Soal per Layar:</strong> Kerjakan setiap butir soal secara runtut dengan indikator progres pengerjaan.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 text-base leading-none">✓</span>
              <span>
                <strong>Evaluasi Instan & Pembahasan:</strong> Tekan tombol <em>Periksa</em> untuk melihat jawaban yang benar beserta penjelasan mendalam.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-600 text-base leading-none">💡</span>
              <span>
                <strong>Fasilitas Petunjuk:</strong> Jika kamu ragu, buka petunjuk soal. Menggunakan petunjuk <strong>tidak mengurangi skormu</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-600 text-base leading-none">⌨️</span>
              <span>
                <strong>Aksesibilitas Keyboard:</strong> Gunakan tombol angka <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-semibold">1-4</kbd> atau huruf <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-semibold">A-D</kbd> untuk memilih opsi, serta <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-semibold">Enter</kbd> untuk memeriksa.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-slate-600 text-base leading-none">🔄</span>
              <span>
                <strong>Bisa Diulang Bebas:</strong> Kamu dapat mengulang kuis kapan saja sampai benar-benar paham.
              </span>
            </li>
          </ul>
        </div>

        {/* Pengaturan Urutan Opsi (Diacak / Sesuai JSON) */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <label htmlFor="toggle-acak-opsi" className="flex items-center gap-3 cursor-pointer">
            <input
              id="toggle-acak-opsi"
              type="checkbox"
              checked={acakOpsi}
              onChange={(e) => onToggleAcakOpsi(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700">
              Acak urutan pilihan opsi (A/B/C/D) saat kuis dimulai
            </span>
          </label>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            (Pemeriksaan jawaban tetap 100% akurat)
          </span>
        </div>

        {/* Tombol Aksi Memulai */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onMulai}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition active:scale-[0.99] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <span>Mulai Kuis Sekarang</span>
            <span>🚀</span>
          </button>
          <Link
            href={`/materi/${babNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[48px]"
          >
            &larr; Kembali ke Materi Misi {babNumber}
          </Link>
        </div>
      </div>
    </div>
  );
}
