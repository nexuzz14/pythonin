import Link from 'next/link';
import { getAllBabSummaries } from '@/lib/content';

export const metadata = {
  title: 'Materi Pembelajaran — Pythonin',
  description: 'Daftar 5 bab materi dasar pemrograman Python.',
};

export default function MateriIndexPage() {
  const babList = getAllBabSummaries();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Materi Pembelajaran
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Pilih misi belajar dasar pemrograman Python yang ingin kamu pelajari.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900">
        <p className="font-medium">
          ℹ️ Halaman ini akan diisi pada tahap berikutnya (Tahap 3).
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {babList.map((bab) => (
          <Link
            key={bab.id}
            href={`/materi/${bab.nomor}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-400 hover:shadow-sm min-h-[44px]"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  Misi {bab.nomor}
                </span>
                <span className="text-xs text-slate-500">
                  ⏱️ {bab.durasi_menit} menit
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{bab.judul}</h2>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{bab.ringkasan}</p>
            </div>
            <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 shrink-0">
              Lihat Materi &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
