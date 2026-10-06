import React from 'react';
import type { IstilahGlosarium } from '@/types/content';

export interface DaftarIstilahProps {
  istilah: IstilahGlosarium[];
  className?: string;
}

/**
 * Komponen Glosarium / Daftar Istilah Teknis (Single Responsibility).
 * Membantu siswa memahami terminologi pemrograman baru tanpa perlu menghafal secara kaku.
 */
export default function DaftarIstilah({
  istilah,
  className = '',
}: DaftarIstilahProps) {
  if (!istilah || istilah.length === 0) return null;

  return (
    <section
      id="daftar-istilah"
      className={`scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs ${className}`}
      aria-labelledby="heading-daftar-istilah"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xl shadow-2xs"
          aria-hidden="true"
        >
          📖
        </span>
        <div>
          <h3
            id="heading-daftar-istilah"
            className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
          >
            Daftar Istilah & Glosarium
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Kamus istilah teknis baru yang diperkenalkan di bab ini
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {istilah.map((item, index) => (
          <div
            key={index}
            className="flex flex-col justify-start rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200/60 break-all">
                {item.istilah}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {item.arti}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
