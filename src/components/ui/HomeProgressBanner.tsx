'use client';

import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/lib/progress';

export default function HomeProgressBanner() {
  const { isHydrated, stats } = useProgress();

  if (!isHydrated || stats.overallPercentage === 0) {
    return null;
  }

  return (
    <div className="mb-10 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/80 p-4 sm:p-5 shadow-xs animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white text-xl shadow-xs">
            📊
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Progress Belajar Aktif
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-extrabold text-blue-700">
                {stats.overallPercentage}%
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {stats.completedChapters} Misi Selesai • {stats.passedChallenges} Tantangan Lolos • {stats.attemptedQuizzes} Kuis Dikerjakan
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/progress"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition min-h-[40px]"
          >
            <span>Lihat Detail Progress</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
