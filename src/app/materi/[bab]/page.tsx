import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBabById } from '@/lib/content';

interface Props {
  params: Promise<{
    bab: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { bab } = await params;
  const babData = getBabById(bab);

  if (!babData) {
    return {
      title: 'Bab Tidak Ditemukan — Pythonin',
    };
  }

  return {
    title: `${babData.judul} — Pythonin`,
    description: babData.ringkasan,
  };
}

export default async function MateriDetailPage({ params }: Props) {
  const { bab } = await params;
  const babData = getBabById(bab);

  // Jika nomor bab tidak valid atau file konten tidak ada, tampilkan 404
  if (!babData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/materi" className="hover:text-blue-600 transition-colors">
          Materi
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Misi {bab}</span>
      </nav>

      {/* Header Bab */}
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-block rounded-md bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
          Misi {bab} • Durasi ± {babData.durasi_menit} Menit
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {babData.judul}
        </h1>
        <p className="mt-3 text-base text-slate-700 leading-relaxed">
          {babData.ringkasan}
        </p>
      </div>

      {/* Penanda Tahap */}
      <div className="mt-8 rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 p-8 text-center">
        <span className="text-4xl">📖</span>
        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Materi Lengkap Misi {bab}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Halaman ini akan diisi pada tahap berikutnya (Tahap 3) dengan komponen penjelasan interaktif, analogi dunia nyata, dan live code editor.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/materi"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px] flex items-center"
          >
            &larr; Kembali ke Daftar Materi
          </Link>
          <Link
            href={`/kuis/${bab}`}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition min-h-[44px] flex items-center"
          >
            Lihat Kuis Misi {bab} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
