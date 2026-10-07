'use client';

import React, { useState } from 'react';
import type { LineDiff } from '@/lib/challenge-checker';

export interface OutputDiffViewerProps {
  studentOutput: string;
  expectedOutput: string;
  lineDiffs: LineDiff[];
  diffSummary?: string;
  className?: string;
}

/**
 * Komponen Visualisasi Perbandingan Output Siswa vs Target Output (Kebutuhan 3).
 * Menampilkan output berdampingan (atau bertumpuk di HP) beserta penyorotan selisih baris yang mudah dipahami pemula.
 */
export default function OutputDiffViewer({
  studentOutput,
  expectedOutput,
  lineDiffs,
  diffSummary,
  className = '',
}: OutputDiffViewerProps) {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'line-by-line'>('side-by-side');

  const isEmptyStudent = !studentOutput || studentOutput.trim() === '';

  return (
    <div
      className={`rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 shadow-xs ${className}`}
      aria-label="Panel Perbandingan Output"
    >
      {/* Header Evaluasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white text-sm font-bold shadow-xs">
            ✕
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-rose-950">
              Belum Tepat: Hasil Belum Sesuai Target
            </h4>
            {diffSummary && (
              <p className="text-xs text-rose-800 font-medium mt-0.5">
                {diffSummary}
              </p>
            )}
          </div>
        </div>

        {/* Tab Switcher Tampilan */}
        <div className="flex rounded-lg bg-rose-100/80 p-0.5 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('side-by-side')}
            className={`rounded-md px-3 py-1 transition ${
              activeTab === 'side-by-side'
                ? 'bg-white text-rose-900 shadow-2xs font-bold'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Berdampingan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('line-by-line')}
            className={`rounded-md px-3 py-1 transition ${
              activeTab === 'line-by-line'
                ? 'bg-white text-rose-900 shadow-2xs font-bold'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Analisis Baris ({lineDiffs.filter((d) => d.status !== 'match').length})
          </button>
        </div>
      </div>

      {/* Tampilan 1: Berdampingan (Side-by-Side) */}
      {activeTab === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom Kiri: Output Kodemu */}
          <div className="flex flex-col rounded-xl border border-rose-300 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between bg-rose-100/80 px-3.5 py-2 border-b border-rose-200 text-xs font-bold text-rose-900">
              <span className="flex items-center gap-1.5">
                <span className="text-rose-600">❌</span> Output Kodemu
              </span>
              <span className="text-[11px] font-normal text-rose-700">
                {isEmptyStudent ? 'Kosong' : `${studentOutput.split('\n').length} baris`}
              </span>
            </div>
            <div className="p-3 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto min-h-[120px] max-h-72 leading-relaxed">
              {isEmptyStudent ? (
                <span className="text-rose-400 italic">
                  (Tidak ada teks yang dicetak ke layar)
                </span>
              ) : (
                <pre className="whitespace-pre font-mono">{studentOutput}</pre>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Target Output yang Diharapkan */}
          <div className="flex flex-col rounded-xl border border-emerald-300 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between bg-emerald-100/80 px-3.5 py-2 border-b border-emerald-200 text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">🎯</span> Target Output yang Diharapkan
              </span>
              <span className="text-[11px] font-normal text-emerald-700">
                {expectedOutput.split('\n').length} baris
              </span>
            </div>
            <div className="p-3 bg-slate-950 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto min-h-[120px] max-h-72 leading-relaxed">
              <pre className="whitespace-pre font-mono">{expectedOutput}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tampilan 2: Analisis Perbedaan Per Baris */}
      {activeTab === 'line-by-line' && (
        <div className="space-y-2 rounded-xl bg-white p-3 border border-rose-200 text-xs">
          <p className="text-xs text-slate-600 mb-2">
            Pemeriksaan baris demi baris antara kodemu dan target yang diharapkan:
          </p>

          <div className="divide-y divide-slate-100 font-mono">
            {lineDiffs.map((diff) => {
              const isMatch = diff.status === 'match';

              return (
                <div
                  key={diff.lineNumber}
                  className={`py-2 px-2.5 rounded-lg transition-colors ${
                    isMatch
                      ? 'bg-slate-50/50 text-slate-600'
                      : diff.status === 'missing'
                      ? 'bg-amber-50/80 text-amber-900 border border-amber-200'
                      : diff.status === 'extra'
                      ? 'bg-purple-50/80 text-purple-900 border border-purple-200'
                      : 'bg-rose-50/80 text-rose-950 border border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      {isMatch ? '✅' : '⚠️'} Baris #{diff.lineNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isMatch
                          ? 'bg-emerald-100 text-emerald-800'
                          : diff.status === 'missing'
                          ? 'bg-amber-200 text-amber-900'
                          : diff.status === 'extra'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {diff.status === 'match'
                        ? 'Cocok'
                        : diff.status === 'missing'
                        ? 'Kurang Baris'
                        : diff.status === 'extra'
                        ? 'Baris Ekstra'
                        : 'Beda Isi'}
                    </span>
                  </div>

                  {!isMatch && (
                    <div className="space-y-1 text-xs mt-1.5 pl-1">
                      {diff.studentLine !== undefined && (
                        <div className="flex items-start gap-2 text-rose-800 bg-rose-100/60 p-1.5 rounded">
                          <span className="font-bold shrink-0">Kodemu:</span>
                          <span className="break-all font-mono">
                            {diff.studentLine === '' ? '(baris kosong)' : `"${diff.studentLine}"`}
                          </span>
                        </div>
                      )}
                      {diff.expectedLine !== undefined && (
                        <div className="flex items-start gap-2 text-emerald-800 bg-emerald-100/60 p-1.5 rounded">
                          <span className="font-bold shrink-0">Target:</span>
                          <span className="break-all font-mono">
                            {diff.expectedLine === '' ? '(baris kosong)' : `"${diff.expectedLine}"`}
                          </span>
                        </div>
                      )}
                      {diff.reason && (
                        <p className="text-[11px] font-sans text-rose-900 font-semibold pt-0.5">
                          💡 Catatan: {diff.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Petunjuk Memperbaiki */}
      <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-white p-3 text-xs text-slate-700 border border-rose-200/80">
        <span className="text-base shrink-0" aria-hidden="true">💡</span>
        <p className="leading-relaxed">
          Pengecekan otomatis memeriksa setiap huruf, angka, spasi, dan baris. Pastikan teks yang kamu cetak sama persis dengan target output.
        </p>
      </div>
    </div>
  );
}
