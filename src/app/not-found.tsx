import Link from 'next/link';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan — Pythonin',
  description: 'Halaman yang kamu cari tidak ditemukan.',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <span className="text-6xl font-extrabold text-blue-600 sm:text-7xl">404</span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-3 text-base text-slate-600 max-w-md">
        Maaf, halaman atau nomor bab yang kamu tuju tidak ditemukan atau belum tersedia.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition min-h-[44px] flex items-center"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/materi"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px] flex items-center"
        >
          Lihat Daftar Materi
        </Link>
      </div>
    </div>
  );
}
