'use client';

import React from 'react';
import Link from 'next/link';
import KuisCodeBlock from './KuisCodeBlock';
import type { SoalTersusun } from '@/types/kuis';

interface KuisQuestionViewProps {
  babNumber: number;
  currentNumber: number; // 1-based index (misal 3)
  totalSoal: number;
  item: SoalTersusun;
  selectedOriginalIndex: number | null;
  hasChecked: boolean;
  showHint: boolean;
  usedHint: boolean;
  onSelectOption: (originalIndex: number) => void;
  onToggleHint: () => void;
  onPeriksa: () => void;
  onBerikutnya: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Komponen Layar Soal Kuis Interaktif (Kebutuhan 2, 3, 4, 6, 7).
 * Dilengkapi indikator progres, blok kode read-only yang bisa discroll di HP,
 * fasilitas petunjuk tanpa penalti skor, opsi aksesibel keyboard,
 * indikator visual non-warna (ikon + label teks), serta pembahasan detail.
 */
export default function KuisQuestionView({
  babNumber,
  currentNumber,
  totalSoal,
  item,
  selectedOriginalIndex,
  hasChecked,
  showHint,
  usedHint,
  onSelectOption,
  onToggleHint,
  onPeriksa,
  onBerikutnya,
}: KuisQuestionViewProps) {
  const { soal, opsi } = item;
  const progressPercent = Math.round((currentNumber / totalSoal) * 100);
  const isLastQuestion = currentNumber === totalSoal;

  const isJawabanBenar =
    hasChecked && selectedOriginalIndex === soal.jawaban_benar;

  // Lencana warna kesulitan
  const kesulitanBadgeClass = {
    mudah: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sedang: 'bg-amber-100 text-amber-800 border-amber-200',
    sulit: 'bg-rose-100 text-rose-800 border-rose-200',
  }[soal.tingkat];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Baris Navigasi Atas & Info Misi */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
        <Link
          href={`/materi/${babNumber}`}
          className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium min-h-[44px] py-2"
        >
          <span>&larr;</span>
          <span>Kembali ke Materi Misi {babNumber}</span>
        </Link>
        <span className="font-semibold text-slate-700">
          Misi {babNumber} • Kuis Interaktif
        </span>
      </div>

      {/* Bar Indikator Progres Soal */}
      <div className="mb-6 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Soal {currentNumber} dari {totalSoal}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${kesulitanBadgeClass}`}
            >
              Tingkat: {soal.tingkat}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-blue-600">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar Visual */}
        <div
          className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={currentNumber}
          aria-valuemin={1}
          aria-valuemax={totalSoal}
          aria-label={`Progres soal: ${currentNumber} dari ${totalSoal}`}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Capaian Pembelajaran */}
        <div className="mt-3 text-[11px] sm:text-xs text-slate-500 flex items-start gap-1.5">
          <span className="text-blue-500 font-bold shrink-0">🎯 Capaian:</span>
          <span>{soal.capaian}</span>
        </div>
      </div>

      {/* Kartu Pertanyaan & Opsi */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Teks Pertanyaan */}
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-snug">
          {soal.pertanyaan}
        </h2>

        {/* Blok Kode Soal (bila ada) */}
        {soal.kode && <KuisCodeBlock code={soal.kode} />}

        {/* Fasilitas Petunjuk (Kebutuhan 4) */}
        {soal.petunjuk && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onToggleHint}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer min-h-[44px]"
                aria-expanded={showHint}
              >
                <span>💡</span>
                <span>{showHint ? 'Tutup Petunjuk' : 'Butuh Petunjuk?'}</span>
                <span className="text-[10px] text-amber-600 font-normal">
                  (Tekan <kbd className="font-mono">H</kbd>)
                </span>
              </button>

              <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                ✨ Menggunakan petunjuk <strong>tidak mengurangi skor</strong>
              </span>
            </div>

            {showHint && (
              <div
                className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs sm:text-sm text-amber-900 animate-fadeIn"
                role="region"
                aria-label="Petunjuk soal"
              >
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong className="font-bold block text-amber-950 mb-0.5">
                      Petunjuk Belajar:
                    </strong>
                    <p className="leading-relaxed">{soal.petunjuk}</p>
                    {usedHint && (
                      <p className="mt-1 text-[11px] text-amber-700/90 font-medium">
                        ✓ Petunjuk telah dibuka (skor tetap 100% jika benar).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daftar Opsi Jawaban (Kebutuhan 6 & 7) */}
        <div className="mt-6">
          <p id="options-label" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Pilih Jawaban yang Benar:
          </p>

          <div
            role="radiogroup"
            aria-labelledby="options-label"
            className="space-y-3"
          >
            {opsi.map((itemOpsi, index) => {
              const letter = OPTION_LETTERS[index] || String(index + 1);
              const isSelected = selectedOriginalIndex === itemOpsi.indeksAsli;
              const isKunci = itemOpsi.indeksAsli === soal.jawaban_benar;

              // Kondisi styling aksesibel
              let containerStyle =
                'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800';
              let badgeLetterStyle = 'bg-slate-100 text-slate-700 border-slate-300';
              let statusText = null;
              let statusIcon = null;

              if (!hasChecked) {
                if (isSelected) {
                  containerStyle =
                    'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 text-blue-950 font-semibold shadow-xs';
                  badgeLetterStyle = 'bg-blue-600 text-white border-blue-600';
                }
              } else {
                // Evaluasi Setelah Diperiksa
                if (isKunci) {
                  containerStyle =
                    'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-500/80';
                  badgeLetterStyle = 'bg-emerald-600 text-white border-emerald-600';
                  statusIcon = '✅';
                  statusText = isSelected
                    ? 'Jawabanmu Tepat!'
                    : 'Kunci Jawaban yang Benar';
                } else if (isSelected && !isKunci) {
                  containerStyle =
                    'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-2 ring-rose-500/80';
                  badgeLetterStyle = 'bg-rose-600 text-white border-rose-600';
                  statusIcon = '❌';
                  statusText = 'Pilihanmu (Kurang Tepat)';
                } else {
                  containerStyle =
                    'border-slate-200 bg-slate-50/70 text-slate-400 opacity-60';
                  badgeLetterStyle = 'bg-slate-200 text-slate-500 border-slate-300';
                }
              }

              return (
                <button
                  key={`${itemOpsi.indeksAsli}-${index}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={hasChecked}
                  onClick={() => onSelectOption(itemOpsi.indeksAsli)}
                  className={`w-full text-left rounded-2xl border p-4 sm:p-4.5 transition-all flex items-start gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-default ${containerStyle}`}
                >
                  {/* Badge Huruf Opsi & Tombol Pintas */}
                  <span
                    className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold transition ${badgeLetterStyle}`}
                  >
                    {letter}
                  </span>

                  {/* Teks Opsi Jawaban */}
                  <div className="grow min-w-0 pt-0.5">
                    <span className="text-xs sm:text-sm leading-relaxed block break-words">
                      {itemOpsi.teks}
                    </span>

                    {/* Penanda Aksesibilitas Non-Warna (Ikon + Label Teks) */}
                    {statusText && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold">
                        <span aria-hidden="true">{statusIcon}</span>
                        <span
                          className={
                            isKunci
                              ? 'text-emerald-800'
                              : 'text-rose-800'
                          }
                        >
                          {statusText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Indikator Keyboard Shortcut (sebelum diperiksa) */}
                  {!hasChecked && (
                    <span className="hidden sm:inline-block shrink-0 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-400">
                      [{letter}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tombol Periksa (Bila Belum Diperiksa) */}
        {!hasChecked && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {selectedOriginalIndex !== null
                ? 'Pilihan siap diperiksa. Tekan tombol atau tombol Enter.'
                : 'Pilih salah satu jawaban di atas untuk melanjutkan.'}
            </span>

            <button
              type="button"
              disabled={selectedOriginalIndex === null}
              onClick={onPeriksa}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Periksa Jawaban</span>
              <span>🔍</span>
            </button>
          </div>
        )}

        {/* Umpan Balik & Pembahasan (Setelah Diperiksa) */}
        {hasChecked && (
          <div
            className="mt-6 pt-6 border-t border-slate-200 animate-fadeIn"
            role="region"
            aria-live="polite"
            aria-label="Pembahasan dan evaluasi jawaban"
          >
            {/* Banner Hasil Instan */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border flex items-start gap-3.5 mb-5 ${
                isJawabanBenar
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                  isJawabanBenar ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isJawabanBenar ? '🎉' : '💡'}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold">
                  {isJawabanBenar
                    ? 'Luar Biasa, Jawabanmu Benar!'
                    : 'Belum Tepat, Jangan Berkecil Hati!'}
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isJawabanBenar
                    ? 'Pemahaman logikamu tepat sekali pada konsep ini. Pelajari pembahasan di bawah untuk memperdalam wawasan.'
                    : 'Kesalahan adalah bagian dari proses belajar koding. Pahami penjelasannya di bawah ini agar semakin mahir!'}
                </p>
              </div>
            </div>

            {/* Kotak Pembahasan Komprehensif */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                <span>📖</span>
                <span>Pembahasan Lengkap:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {soal.pembahasan}
              </p>
            </div>

            {/* Tombol Lanjut ke Soal Berikutnya / Hasil */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onBerikutnya}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition active:scale-[0.99] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
              >
                <span>
                  {isLastQuestion ? 'Lihat Hasil Kuis' : 'Soal Berikutnya'}
                </span>
                <span>&rarr;</span>
                <span className="text-xs opacity-80 font-normal hidden sm:inline">
                  (Enter)
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
