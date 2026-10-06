import React from 'react';

export interface PoinPentingProps {
  poinPenting: string[];
  className?: string;
}

/**
 * Komponen Rangkuman Poin Penting Bab (Single Responsibility).
 * Memberikan ringkasan takeaway konsep utama yang wajib diingat siswa.
 */
export default function PoinPenting({
  poinPenting,
  className = '',
}: PoinPentingProps) {
  if (!poinPenting || poinPenting.length === 0) return null;

  return (
    <section
      id="poin-penting"
      className={`scroll-mt-24 rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 p-5 sm:p-7 shadow-xs ${className}`}
      aria-labelledby="heading-poin-penting"
    >
      <div className="flex items-center gap-3 border-b border-indigo-100 pb-4 mb-4">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-xl shadow-2xs"
          aria-hidden="true"
        >
          📌
        </span>
        <div>
          <h3
            id="heading-poin-penting"
            className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
          >
            Poin Penting Misi Ini
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Intisari konsep yang perlu kamu ingat dan pahami
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {poinPenting.map((poin, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl bg-white/80 border border-indigo-100/80 p-3 sm:p-3.5 shadow-2xs"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold mt-0.5"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {poin}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
