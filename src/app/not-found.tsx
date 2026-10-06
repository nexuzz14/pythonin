import Button from '@/components/ui/Button';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan — Pythonin',
  description: 'Halaman yang kamu cari tidak ditemukan.',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      {/* Radar Compass SVG Illustration */}
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 border border-blue-200/80 text-blue-600 shadow-sm mb-6">
        <svg
          className="h-12 w-12 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm3.5-11.5l-2.5 6-6 2.5 2.5-6 6-2.5z"
          />
        </svg>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 mb-3">
        <span>⚠️</span>
        <span>Kode Galat: 404</span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Misi di Luar Radar
      </h1>

      <p className="mt-4 text-base text-slate-600 max-w-md leading-relaxed">
        Sepertinya kamu keluar dari rute pembelajaran. Tenang, programmer hebat pun sering salah ketik tautan. Yuk kembali ke jalur misi!
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <Button href="/" variant="primary" size="md" className="w-full sm:w-auto">
          Kembali ke Beranda
        </Button>
        <Button href="/materi" variant="outline" size="md" className="w-full sm:w-auto">
          Lihat Semua Materi
        </Button>
      </div>
    </div>
  );
}
