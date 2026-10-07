import Link from 'next/link';
import { getKuisByBab } from '@/lib/content';

export const metadata = {
  title: 'Kuis Pemahaman — Pythonin',
  description: 'Daftar kuis pemahaman konsep pemrograman Python per bab untuk siswa SMK RPL.',
};

export default function KuisIndexPage() {
  const kuisList = [1, 2, 3, 4, 5].map((bab) => {
    const data = getKuisByBab(bab);
    return {
      bab,
      data,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Halaman Kuis */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-900 mb-3 border border-amber-200">
          <span>🎯</span>
          <span>Evaluasi Pemahaman Interaktif</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Kuis Pemahaman Python
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-2xl">
          Uji pemahamanmu setelah mempelajari setiap misi. Kerjakan soal satu per satu, dapatkan evaluasi dan pembahasan mendalam, serta ulangi kapan saja untuk meraih skor terbaik!
        </p>
      </div>

      {/* Grid 5 Kartu Kuis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kuisList.map(({ bab, data }) => (
          <div
            key={bab}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  Misi {bab}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {data?.soal.length || 5} Soal
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 line-clamp-2">
                {data?.judul_kuis || `Kuis Misi ${bab}`}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                Pilihan ganda dengan evaluasi langsung, petunjuk belajar, dan pembahasan tiap opsi.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Link
                href={`/materi/${bab}`}
                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 transition min-h-[44px] px-2"
              >
                Baca Materi
              </Link>
              <Link
                href={`/kuis/${bab}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs min-h-[44px]"
              >
                <span>Mulai Kuis</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
