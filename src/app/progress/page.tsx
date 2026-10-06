import Link from 'next/link';

export const metadata = {
  title: 'Progress Belajar — Pythonin',
  description: 'Pantau kemajuan belajar dan tantangan yang telah diselesaikan.',
};

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Progress Belajar
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Ringkasan bab yang telah selesai, status tantangan koding, dan skor kuis pemahamanmu.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 p-8 text-center">
        <span className="text-4xl">📊</span>
        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Statistik & Rekap Pembelajaran
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Halaman ini akan diisi pada tahap berikutnya (Tahap 5) dengan penyimpanan localStorage, pelacak tantangan, skor kuis, dan tombol reset.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/materi"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition min-h-[44px] flex items-center"
          >
            Lanjutkan Belajar &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
