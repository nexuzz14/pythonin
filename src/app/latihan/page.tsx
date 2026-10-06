import Link from 'next/link';

export const metadata = {
  title: 'Latihan & Playground — Pythonin',
  description: 'Area latihan bebas dan tantangan koding Python.',
};

export default function LatihanPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Latihan & Playground
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Area bebas untuk bereksperimen dengan kode Python dan mencoba berbagai tantangan koding.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 p-8 text-center">
        <span className="text-4xl">💻</span>
        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Playground & Daftar Tantangan
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Halaman ini akan diisi pada tahap berikutnya dengan editor kode bebas dan daftar seluruh tantangan dari Bab 1 hingga Bab 5.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/materi"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition min-h-[44px] flex items-center"
          >
            Lihat Materi Pembelajaran &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
