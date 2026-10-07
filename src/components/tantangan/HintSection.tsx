'use client';

import React, { useState } from 'react';

export interface HintSectionProps {
  petunjuk: string[];
  contohSolusi: string;
  initialHintsUnlocked?: number;
  onHintUnlocked?: (unlockedCount: number) => void;
  className?: string;
}

const HINT_LABELS = [
  'Arah Berpikir & Konsep',
  'Pola Kode Kunci',
  'Contoh Penulisan Konkret',
];

/**
 * Komponen Petunjuk Bertahap dan Contoh Solusi (Kebutuhan 4).
 * Membuka petunjuk satu per satu dari yang paling halus, dan menampilkan contoh solusi
 * hanya setelah semua petunjuk dibuka atau siswa mengonfirmasi untuk menyerah.
 */
export default function HintSection({
  petunjuk,
  contohSolusi,
  initialHintsUnlocked = 0,
  onHintUnlocked,
  className = '',
}: HintSectionProps) {
  const [unlockedCount, setUnlockedCount] = useState<number>(initialHintsUnlocked);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);

  const totalHints = petunjuk.length;
  const hasMoreHints = unlockedCount < totalHints;

  const handleUnlockNextHint = () => {
    if (hasMoreHints) {
      const nextCount = unlockedCount + 1;
      setUnlockedCount(nextCount);
      if (onHintUnlocked) {
        onHintUnlocked(nextCount);
      }
    }
  };

  const handleOpenSolutionConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSolution = () => {
    setShowConfirmModal(false);
    setSolutionRevealed(true);
    // Jika belum semua petunjuk terbuka, buka semua
    if (unlockedCount < totalHints) {
      setUnlockedCount(totalHints);
      if (onHintUnlocked) {
        onHintUnlocked(totalHints);
      }
    }
  };

  const handleCopySolution = async () => {
    try {
      await navigator.clipboard.writeText(contohSolusi);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    } catch {
      setCopiedSolution(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4 sm:p-5 shadow-xs ${className}`}
      aria-labelledby="heading-petunjuk"
    >
      {/* Header Bagian Petunjuk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white text-base shadow-xs" aria-hidden="true">
            💡
          </span>
          <div>
            <h4 id="heading-petunjuk" className="text-sm sm:text-base font-bold text-amber-950">
              Bantuan & Petunjuk Bertahap
            </h4>
            <p className="text-xs text-amber-800">
              Buka petunjuk satu demi satu jika kamu merasa buntu dalam menyelesaikan tantangan.
            </p>
          </div>
        </div>

        {/* Indikator Jumlah Petunjuk Terbuka */}
        <span className="self-start sm:self-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
          {unlockedCount} dari {totalHints} Petunjuk Terbuka
        </span>
      </div>

      {/* Daftar Petunjuk yang Sudah Dibuka */}
      {unlockedCount > 0 ? (
        <div className="space-y-3 mb-4">
          {petunjuk.slice(0, unlockedCount).map((hintText, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-amber-300/80 bg-white p-3.5 shadow-2xs transition-all animate-fadeIn"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-900">
                  Petunjuk {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {HINT_LABELS[idx] || `Langkah ${idx + 1}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium mt-1">
                {hintText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-300 bg-white/70 p-3.5 text-center mb-4">
          <p className="text-xs text-amber-900 font-medium">
            Belum ada petunjuk yang dibuka. Klik tombol di bawah untuk melihat petunjuk pertama!
          </p>
        </div>
      )}

      {/* Baris Tombol Aksi Bantuan */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {hasMoreHints ? (
          <button
            type="button"
            onClick={handleUnlockNextHint}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-amber-600 active:scale-[0.98] transition min-h-[44px]"
          >
            <span>💡 Butuh Petunjuk</span>
            <span className="rounded-md bg-amber-600/60 px-1.5 py-0.5 text-[11px]">
              Buka {unlockedCount + 1}/{totalHints}
            </span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200">
            <span>✅</span> Semua petunjuk sudah kamu buka
          </span>
        )}

        {/* Tombol Buka Contoh Solusi */}
        {!solutionRevealed ? (
          <button
            type="button"
            onClick={handleOpenSolutionConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition min-h-[44px]"
          >
            <span>🔑 Buka Contoh Solusi</span>
          </button>
        ) : (
          <span className="text-xs font-semibold text-slate-500">
            (Contoh solusi sudah terbuka di bawah)
          </span>
        )}
      </div>

      {/* Panel Contoh Solusi (Jika Dibuka) */}
      {solutionRevealed && (
        <div className="mt-5 rounded-xl border border-blue-300 bg-blue-50/60 p-4 shadow-2xs animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <span>🎯</span>
              <span>Contoh Solusi Referensi:</span>
            </div>
            <button
              type="button"
              onClick={handleCopySolution}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-200 transition min-h-[44px]"
            >
              {copiedSolution ? '✓ Tersalin' : '📋 Salin Kode'}
            </button>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-emerald-300 whitespace-pre">
              {contohSolusi}
            </pre>
          </div>

          <p className="mt-2 text-[11px] text-blue-800 leading-normal">
            💡 Pelajari bagaimana struktur kode di atas memecahkan tantangan ini, lalu coba ketik kembali dengan pemahamanmu sendiri.
          </p>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Menyerah / Membuka Solusi */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-solusi-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                ⚠️
              </span>
              <div>
                <h3 id="modal-solusi-title" className="text-base sm:text-lg font-bold text-slate-900">
                  Buka Contoh Solusi?
                </h3>
                <span className="text-xs text-slate-500">
                  Konfirmasi Bantuan Lanjutan
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {unlockedCount < totalHints ? (
                <>
                  Kamu baru membuka <strong>{unlockedCount} dari {totalHints}</strong> petunjuk. Mencoba memecahkannya sendiri akan melatih kemampuan analisismu jauh lebih baik!
                  <br /><br />
                  Apakah kamu yakin ingin menyerah dan melihat contoh solusi sekarang?
                </>
              ) : (
                'Kamu telah membuka seluruh petunjuk. Apakah kamu ingin melihat contoh solusi kode referensi sekarang?'
              )}
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px]"
              >
                Batal, Coba Lagi Sendiri
              </button>
              <button
                type="button"
                onClick={handleConfirmSolution}
                className="w-full sm:w-auto rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-amber-700 transition min-h-[44px]"
              >
                Ya, Buka Contoh Solusi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
