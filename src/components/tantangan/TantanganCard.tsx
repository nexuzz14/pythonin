'use client';

import React from 'react';
import type { ItemTantangan } from '@/types/content';
import type { ChallengeStatus } from '@/types/progress';

export interface TantanganCardProps {
  babNumber: number;
  challenge: ItemTantangan;
  status: ChallengeStatus;
  attempts?: number;
  hintsUsed?: number;
  onSelect: (babNum: number, challengeId: number) => void;
  className?: string;
}

export default function TantanganCard({
  babNumber,
  challenge,
  status,
  attempts = 0,
  hintsUsed = 0,
  onSelect,
  className = '',
}: TantanganCardProps) {
  const badgeLevelColor =
    challenge.tingkat === 'mudah'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : challenge.tingkat === 'sedang'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';

  const renderStatusBadge = () => {
    switch (status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <span>✅</span> Selesai
          </span>
        );
      case 'dicoba':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            <span>⏳</span> Dicoba {attempts > 0 ? `(${attempts}x)` : ''}
          </span>
        );
      case 'belum':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Belum Dicoba
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-400 hover:shadow-md ${className}`}
    >
      <div>
        {/* Header Kartu: Nomor Tantangan, Tingkat Kesulitan, & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-800">
              #{challenge.id}
            </span>
            <span
              className={`rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${badgeLevelColor}`}
            >
              {challenge.tingkat}
            </span>
          </div>

          <div>{renderStatusBadge()}</div>
        </div>

        {/* Judul Tantangan */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          {challenge.judul}
        </h3>

        {/* Cuplikan Cerita */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
          {challenge.cerita}
        </p>

        {/* Info Tambahan Hints / Percobaan */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          {hintsUsed > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
              💡 {hintsUsed} Petunjuk
            </span>
          )}
          {attempts > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
              🔄 {attempts}x Percobaan
            </span>
          )}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelect(babNumber, challenge.id)}
          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition min-h-[44px] ${
            status === 'selesai'
              ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              : 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          <span>{status === 'selesai' ? 'Buka Kembali' : 'Kerjakan Tantangan'}</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
