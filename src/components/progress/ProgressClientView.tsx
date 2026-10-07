'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { BabSummary } from '@/types/content';
import type { TantanganBabGroup } from '@/lib/content';
import { useProgress } from '@/lib/progress';

export interface ProgressClientViewProps {
  babList: BabSummary[];
  tantanganGroups: TantanganBabGroup[];
}

export default function ProgressClientView({
  babList,
  tantanganGroups,
}: ProgressClientViewProps) {
  const {
    progress,
    isHydrated,
    stats,
    hasCorruptedDataReset,
    isStorageAvailable,
    resetProgress,
    getChapterStatus,
    getChallengeStatus,
  } = useProgress();

  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<boolean>(false);

  const handleConfirmReset = () => {
    resetProgress();
    setShowResetModal(false);
    setResetSuccessMessage(true);
    setTimeout(() => {
      setResetSuccessMessage(false);
    }, 4000);
  };

  // Format tanggal waktu terakhir belajar
  const formatLastActivity = (isoString: string | null) => {
    if (!isoString) return 'Belum ada aktivitas';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notifikasi Berhasil Reset */}
      {resetSuccessMessage && (
        <div
          role="status"
          className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-900 shadow-md animate-fadeIn flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✅</span>
            <span className="text-xs sm:text-sm font-bold">
              Semua data kemajuan belajar berhasil direset ke awal.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setResetSuccessMessage(false)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-3 py-2 min-h-[44px] inline-flex items-center"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Banner Peringatan Data Rusak Direset (Kebutuhan 7) */}
      {hasCorruptedDataReset && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-950 shadow-sm animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                Data Progres Sebelumnya Tidak Terbaca
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Format data penyimpanan di browser sempat rusak atau tidak sesuai. Data lama telah disalin ke cadangan backup dan progres belajar dimulai kembali dari awal secara aman.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banner Mode Privat / Storage Tidak Tersedia */}
      {!isStorageAvailable && isHydrated && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-950 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-lg">🔒</span>
            <p className="text-xs leading-relaxed">
              <strong>Penyimpanan Browser Terbatas:</strong> Mode privat atau setelan privasi browser membatasi penyimpanan lokal. Progresmu tetap aktif selama tab ini terbuka, namun tidak akan tersimpan setelah browser ditutup.
            </p>
          </div>
        </div>
      )}

      {/* Banner Penjelasan Data Lokal & Komputer Bersama (Kebutuhan 11 & PRD 11.3) */}
      <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200/60">
              <span>🔒</span>
              <span>Privasi Terjaga • Tanpa Akun</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Penyimpanan Lokal di Browser Perangkat Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Seluruh kemajuan membaca materi, hasil tantangan koding, dan skor kuis tersimpan secara mandiri di penyimpanan browser perangkat ini. Tidak ada data pribadi yang dikirimkan ke server.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 self-start sm:self-auto shrink-0 max-w-xs">
            <span className="font-bold block mb-0.5">💻 Memakai Laptop Bersama?</span>
            <span className="text-amber-800 text-[11px] leading-normal block">
              Gunakan tombol <strong>Reset Progress</strong> di bawah halaman sebelum pergantian pengguna agar temanmu mulai dari awal.
            </span>
          </div>
        </div>
      </div>

      {/* Friendly Empty State if No Progress Yet */}
      {isHydrated && stats.overallPercentage === 0 && (
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-6 sm:p-8 text-center shadow-xs animate-fadeIn">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl shadow-sm mb-4">
            🚀
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Mulai Petualangan Koding Python-mu!
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Kamu belum memiliki riwayat belajar yang tercatat. Selesaikan bagian materi, pecahkan tantangan koding interaktif, dan raih skor kuis terbaik untuk memenuhi progres belajarmu!
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/materi/1"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] transition min-h-[44px]"
            >
              <span>Mulai Belajar Misi 1 Sekarang</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      )}

      {/* Kartu Ringkasan Persentase & Metrik Utama (Kebutuhan 9) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ringkasan Keseluruhan
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {isHydrated ? `${stats.overallPercentage}% Selesai` : 'Menghitung...'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Waktu terakhir belajar: <strong className="text-slate-700">{formatLastActivity(stats.lastActivityAt)}</strong>
            </p>
          </div>

          {/* Visual Progress Bar Besar */}
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Total Progres Pembelajaran</span>
              <span className="text-blue-600">{stats.overallPercentage}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${isHydrated ? stats.overallPercentage : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid 4 Kartu Statistik Ringkas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* 1. Misi Bab */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="text-2xl mb-1">🏁</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {stats.completedChapters} <span className="text-xs font-medium text-slate-500">/ {stats.totalChapters}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Misi Bab Selesai</div>
          </div>

          {/* 2. Tantangan Koding */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="text-2xl mb-1">🧩</div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-600">
              {stats.passedChallenges} <span className="text-xs font-medium text-slate-500">/ {stats.totalChallenges}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Tantangan Lolos</div>
          </div>

          {/* 3. Kuis Pembahasan */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              {stats.attemptedQuizzes} <span className="text-xs font-medium text-slate-500">/ {stats.totalQuizzes}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Kuis Dikerjakan</div>
          </div>

          {/* 4. Materi Dibaca */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-600">
              {stats.readSectionsCount} <span className="text-xs font-medium text-slate-500">/ {stats.totalReadSections}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Bagian Materi Dibaca</div>
          </div>
        </div>
      </div>

      {/* Rincian Status Per Bab (Misi 1 s.d. 5) */}
      <section className="space-y-4" aria-labelledby="heading-rincian-bab">
        <div className="flex items-center justify-between">
          <h3 id="heading-rincian-bab" className="text-lg sm:text-xl font-bold text-slate-900">
            Rincian Status Tiap Misi
          </h3>
          <span className="text-xs text-slate-500 font-medium">5 Misi Pembelajaran</span>
        </div>

        <div className="space-y-4">
          {babList.map((bab) => {
            const chStatus = isHydrated ? getChapterStatus(bab.nomor) : 'belum';
            const chapterData = progress.chapters[`bab-${bab.nomor}`];
            const groupTantangan = tantanganGroups.find((g) => g.babNumber === bab.nomor);
            const tantanganList = groupTantangan?.data.tantangan || [];

            const readCount = chapterData?.readSections?.length || 0;
            const quizData = chapterData?.quiz;

            return (
              <div
                key={bab.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition hover:border-blue-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-blue-800">
                        Misi {bab.nomor}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900">
                        {bab.judul}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {bab.ringkasan}
                    </p>
                  </div>

                  {/* Status Badge Bab */}
                  <div className="self-start lg:self-auto">
                    {chStatus === 'selesai' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <span>✅</span> Misi Selesai
                      </span>
                    ) : chStatus === 'sedang' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                        <span>⏳</span> Sedang Berjalan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Belum Dimulai
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid Rincian 3 Komponen: Materi, Tantangan, Kuis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                  {/* Kolom 1: Status Materi */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span>📖</span> Materi Belajar
                      </span>
                      <span className="text-purple-700 font-extrabold">
                        {readCount} / 4 Bagian
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.round((readCount / 4) * 100)}%` }}
                      />
                    </div>
                    <Link
                      href={`/materi/${bab.nomor}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 min-h-[44px] py-2"
                    >
                      <span>Buka Materi Misi {bab.nomor} &rarr;</span>
                    </Link>
                  </div>

                  {/* Kolom 2: Status Tantangan Koding */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span>🧩</span> Tantangan Koding
                      </span>
                      <span className="text-blue-700 font-extrabold">
                        {tantanganList.filter((t) => getChallengeStatus(bab.nomor, t.id) === 'selesai').length} / 3 Lolos
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 divide-y divide-slate-100">
                      {tantanganList.map((t) => {
                        const st = isHydrated ? getChallengeStatus(bab.nomor, t.id) : 'belum';
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between text-xs text-slate-700 min-h-[44px] py-1"
                          >
                            <Link
                              href={`/latihan?bab=${bab.nomor}&id=${t.id}`}
                              className="hover:text-blue-600 truncate max-w-[170px] sm:max-w-[210px] font-medium min-h-[44px] inline-flex items-center"
                            >
                              #{t.id} {t.judul}
                            </Link>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                                st === 'selesai'
                                  ? 'text-emerald-800 bg-emerald-100'
                                  : st === 'dicoba'
                                  ? 'text-amber-800 bg-amber-100'
                                  : 'text-slate-500 bg-slate-200/80'
                              }`}
                            >
                              {st === 'selesai' ? 'Lolos' : st === 'dicoba' ? 'Dicoba' : 'Belum'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <Link
                      href={`/latihan?bab=${bab.nomor}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 min-h-[44px] py-2"
                    >
                      <span>Kerjakan Tantangan &rarr;</span>
                    </Link>
                  </div>

                  {/* Kolom 3: Status Kuis */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span>🎯</span> Kuis Pemahaman
                      </span>
                      <span className="text-emerald-700 font-extrabold">
                        {quizData ? `Skor ${quizData.bestScore} / ${quizData.total}` : 'Belum'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                      {quizData ? (
                        <>
                          <div>Skor Terakhir: <strong>{quizData.lastScore} / {quizData.total}</strong> ({Math.round((quizData.lastScore / quizData.total) * 100)}%)</div>
                          <div>Skor Terbaik: <strong>{quizData.bestScore} / {quizData.total}</strong> ({Math.round((quizData.bestScore / quizData.total) * 100)}%)</div>
                          <div>Jumlah Percobaan: <strong>{quizData.attempts}x</strong></div>
                        </>
                      ) : (
                        <p className="text-slate-500 italic">
                          Belum pernah mencoba kuis bab ini.
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/kuis/${bab.nomor}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 min-h-[44px] py-2"
                    >
                      <span>{quizData ? 'Ulangi Kuis &rarr;' : 'Mulai Kuis &rarr;'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tombol Aksi Reset Progress (Kebutuhan 9 & DoD) */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-rose-950">
            Hapus / Reset Progress Belajar
          </h4>
          <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
            Mereset seluruh riwayat materi yang dibaca, tantangan lolos, dan nilai kuis di browser ini.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition min-h-[44px] shrink-0"
        >
          <span>🗑️ Reset Progress</span>
        </button>
      </div>

      {/* Modal Dialog Konfirmasi Reset Progress (Accessible) */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-reset-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                ⚠️
              </span>
              <div>
                <h3 id="modal-reset-title" className="text-base sm:text-lg font-bold text-slate-900">
                  Reset Semua Progress?
                </h3>
                <span className="text-xs text-slate-500">Konfirmasi Penghapusan Data</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Apakah kamu yakin ingin menghapus seluruh progres belajar di browser ini? Seluruh data materi yang dibaca, tantangan yang telah diselesaikan, serta riwayat skor kuis akan dihapus secara permanen.
              <br /><br />
              <strong className="text-rose-900">Tindakan ini tidak dapat dibatalkan.</strong>
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="w-full sm:w-auto rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition min-h-[44px]"
              >
                Ya, Hapus Semua Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
