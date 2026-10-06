'use client';

import React from 'react';
import Link from 'next/link';
import KuisCodeBlock from './KuisCodeBlock';
import type { HasilKuis } from '@/types/kuis';

interface KuisResultViewProps {
  hasil: HasilKuis;
  onUlangi: () => void;
}

/**
 * Komponen Layar Hasil Kuis (Kebutuhan 5).
 * Menampilkan skor total, persentase kelulusan, ringkasan per tingkat kesulitan,
 * daftar soal yang salah beserta pembahasannya,
 * serta tombol navigasi ulangi kuis dan lanjut ke bab berikutnya.
 */
export default function KuisResultView({
  hasil,
  onUlangi,
}: KuisResultViewProps) {
  const {
    babNumber,
    judulKuis,
    skor,
    totalSoal,
    persentase,
    rincianKesulitan,
    soalSalah,
  } = hasil;

  // Pesan evaluasi dan apresiasi berdasarkan capaian skor
  const isPerfect = skor === totalSoal;
  const isGood = persentase >= 75;
  const isPassed = persentase >= 60;

  let apresiasiJudul = 'Ayo Coba Lagi & Asah Terus!';
  let apresiasiPesan =
    'Jangan patah semangat. Luangkan waktu untuk mengkaji materi dan pembahasan di bawah ini, lalu ulangi kuis sampai skor maksimal.';
  let iconHasil = '💪';
  let badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';

  if (isPerfect) {
    apresiasiJudul = 'Luar Biasa, Sempurna 100%!';
    apresiasiPesan =
      'Kamu berhasil menjawab seluruh soal dengan tepat tanpa satu pun kesalahan. Logika pemahamanmu pada bab ini sangat solid!';
    iconHasil = '🏆';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (isGood) {
    apresiasiJudul = 'Hebat Sekali!';
    apresiasiPesan =
      'Sebagian besar materi telah kamu kuasai dengan sangat baik. Cermati sedikit bagian yang keliru untuk persiapan bab berikutnya.';
    iconHasil = '🌟';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (isPassed) {
    apresiasiJudul = 'Cukup Bagus, Kamu Lulus!';
    apresiasiPesan =
      'Konsep dasar bab ini sudah mulai kamu pahami. Agar makin mantap, baca kembali pembahasan soal-soal di bawah ya.';
    iconHasil = '👍';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  // Tautan bab berikutnya
  const nextBab = babNumber < 5 ? babNumber + 1 : null;

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
        <span className="text-slate-900 font-semibold">Hasil Kuis</span>
      </nav>

      {/* Kartu Ringkasan Skor Utama */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-center">
        {/* Ikon Pencapaian */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-4xl shadow-2xs mb-4">
          {iconHasil}
        </div>

        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold border mb-2 ${badgeColor}`}>
          Hasil Akhir Kuis Misi {babNumber}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {apresiasiJudul}
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
          {judulKuis}
        </p>

        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          {apresiasiPesan}
        </p>

        {/* Skor & Persentase Visual */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">
              Skor Perolehan
            </span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-700">
                {skor}
              </span>
              <span className="text-sm font-semibold text-blue-500">
                /{totalSoal}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Persentase
            </span>
            <div className="mt-1 flex items-baseline justify-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {persentase}%
              </span>
            </div>
          </div>
        </div>

        {/* Ringkasan per Tingkat Kesulitan */}
        <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center sm:text-left">
            📊 Rincian Akurasi Berdasarkan Tingkat Kesulitan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mudah */}
            <div className="rounded-xl bg-white border border-emerald-200 p-3.5 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-emerald-800 block">Mudah</span>
                <span className="text-[11px] text-slate-500">
                  {rincianKesulitan.mudah.total > 0
                    ? `${Math.round((rincianKesulitan.mudah.benar / rincianKesulitan.mudah.total) * 100)}% tepat`
                    : 'Tidak ada soal'}
                </span>
              </div>
              <span className="text-base font-extrabold text-emerald-700">
                {rincianKesulitan.mudah.benar}/{rincianKesulitan.mudah.total}
              </span>
            </div>

            {/* Sedang */}
            <div className="rounded-xl bg-white border border-amber-200 p-3.5 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-amber-800 block">Sedang</span>
                <span className="text-[11px] text-slate-500">
                  {rincianKesulitan.sedang.total > 0
                    ? `${Math.round((rincianKesulitan.sedang.benar / rincianKesulitan.sedang.total) * 100)}% tepat`
                    : 'Tidak ada soal'}
                </span>
              </div>
              <span className="text-base font-extrabold text-amber-700">
                {rincianKesulitan.sedang.benar}/{rincianKesulitan.sedang.total}
              </span>
            </div>

            {/* Sulit */}
            <div className="rounded-xl bg-white border border-rose-200 p-3.5 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-rose-800 block">Sulit</span>
                <span className="text-[11px] text-slate-500">
                  {rincianKesulitan.sulit.total > 0
                    ? `${Math.round((rincianKesulitan.sulit.benar / rincianKesulitan.sulit.total) * 100)}% tepat`
                    : 'Tidak ada soal'}
                </span>
              </div>
              <span className="text-base font-extrabold text-rose-700">
                {rincianKesulitan.sulit.benar}/{rincianKesulitan.sulit.total}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Navigasi Utama */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onUlangi}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer"
          >
            <span>🔄</span>
            <span>Ulangi Kuis</span>
          </button>

          {nextBab ? (
            <Link
              href={`/materi/${nextBab}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              <span>Lanjut ke Misi {nextBab}</span>
              <span>&rarr;</span>
            </Link>
          ) : (
            <Link
              href="/progress"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition min-h-[48px]"
            >
              <span>Lihat Rekap Progres Belajar</span>
              <span>🎉</span>
            </Link>
          )}

          <Link
            href={`/materi/${babNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[48px]"
          >
            Kembali ke Materi Misi {babNumber}
          </Link>
        </div>
      </div>

      {/* Bagian Pembahasan Soal yang Salah (Kebutuhan 5) */}
      {soalSalah.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-rose-600">❌</span>
              <span>Daftar Soal yang Perlu Dipelajari Kembali ({soalSalah.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {soalSalah.map((item, idx) => (
              <div
                key={item.soal.id}
                className="rounded-2xl border border-rose-200 bg-white p-5 sm:p-6 shadow-2xs"
              >
                {/* Header Soal Salah */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="rounded-md bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                    Soal #{idx + 1} • Tingkat {item.soal.tingkat}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID #{item.soal.id}
                  </span>
                </div>

                {/* Teks Pertanyaan */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2">
                  {item.soal.pertanyaan}
                </h3>

                {/* Kode bila ada */}
                {item.soal.kode && <KuisCodeBlock code={item.soal.kode} />}

                {/* Perbandingan Jawaban */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {/* Pilihan Siswa */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                      <span>❌</span>
                      <span>Pilihanmu:</span>
                    </span>
                    <p className="text-slate-800 font-medium break-words">
                      {item.opsiDipilihTeks}
                    </p>
                  </div>

                  {/* Kunci Jawaban Benar */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                      <span>✅</span>
                      <span>Kunci Jawaban yang Benar:</span>
                    </span>
                    <p className="text-slate-800 font-medium break-words">
                      {item.opsiBenarTeks}
                    </p>
                  </div>
                </div>

                {/* Pembahasan Soal */}
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs sm:text-sm">
                  <span className="font-bold text-blue-900 block mb-1">
                    📖 Pembahasan Lengkap:
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.soal.pembahasan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bagian Jika Semua Jawaban Benar */}
      {isPerfect && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
          <span className="text-3xl block mb-2">🎉</span>
          <h2 className="text-base sm:text-lg font-bold text-emerald-950">
            Hebat! Tidak Ada Jawaban yang Salah
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
            Semua soal terjawab dengan benar. Kamu siap melanjutkan petualangan ke materi pemrograman berikutnya!
          </p>
        </div>
      )}
    </div>
  );
}
