import React from 'react';

export interface ObjectiveCardProps {
  tujuan: string[];
  prasyarat: string[];
  ringkasan: string;
  className?: string;
}

/**
 * Komponen Tujuan Pembelajaran, Prasyarat, dan Ringkasan Bab (Single Responsibility).
 * Ditampilkan di bagian atas materi bab agar siswa memahami target kompetensi dan kesiapannya.
 */
export default function ObjectiveCard({
  tujuan,
  prasyarat,
  ringkasan,
  className = '',
}: ObjectiveCardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Kartu Ringkasan Bab */}
      {ringkasan && (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
            <span className="text-base" aria-hidden="true">📖</span>
            <span>Gambaran Misi</span>
          </div>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            {ringkasan}
          </p>
        </div>
      )}

      {/* Grid Tujuan Belajar dan Prasyarat */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Kolom Tujuan Belajar */}
        <div className="md:col-span-7 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-base shadow-2xs" aria-hidden="true">
              🎯
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Tujuan Pembelajaran
              </h2>
              <p className="text-xs text-slate-500">
                Kompetensi yang akan kamu kuasai setelah menyelesaikan bab ini:
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 mt-4">
            {tujuan.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-normal">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200/80 text-emerald-800 font-bold text-[11px] mt-0.5" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom Prasyarat */}
        <div className="md:col-span-5 rounded-2xl border border-blue-200/90 bg-blue-50/40 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800 text-base shadow-2xs" aria-hidden="true">
                🔑
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Prasyarat Belajar
                </h2>
                <p className="text-xs text-slate-500">
                  Bekal awal sebelum memulai materi:
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 mt-4">
              {prasyarat.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200/80 text-blue-800 font-bold text-[11px] mt-0.5" aria-hidden="true">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-xl bg-white/80 border border-blue-100 p-3 text-xs text-blue-900/90 flex items-center gap-2">
            <span aria-hidden="true">💡</span>
            <span>Pelajari secara bertahap dan jalankan setiap contoh kode!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
