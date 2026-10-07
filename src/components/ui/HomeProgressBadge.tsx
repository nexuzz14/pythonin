'use client';

import React from 'react';
import { useProgress } from '@/lib/progress';

export interface HomeProgressBadgeProps {
  babNomor: number;
}

export default function HomeProgressBadge({ babNomor }: HomeProgressBadgeProps) {
  const { isHydrated, getChapterStatus, progress } = useProgress();

  if (!isHydrated) {
    return null;
  }

  const status = getChapterStatus(babNomor);
  const chapterData = progress.chapters[`bab-${babNomor}`];
  const passedChallenges = Object.values(chapterData?.challenges || {}).filter(
    (c) => c.passed
  ).length;

  if (status === 'selesai') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
        <span>✅</span> Selesai
      </span>
    );
  }

  if (status === 'sedang') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
        <span>⏳</span> Sedang ({passedChallenges}/3 🧩)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Belum Mulai
    </span>
  );
}
