import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKuisByBab } from '@/lib/content';

interface Props {
  params: Promise<{
    bab: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { bab } = await params;
  const kuisData = getKuisByBab(bab);

  if (!kuisData) {
    return {
      title: 'Kuis Tidak Ditemukan — Pythonin',
    };
  }

  return {
    title: `${kuisData.judul_kuis} — Pythonin`,
  };
}

export default async function KuisDetailPage({ params }: Props) {
  const { bab } = await params;
  const kuisData = getKuisByBab(bab);

  // Jika bab tidak valid atau file kuis tidak ditemukan, tampilkan 404
  if (!kuisData) {
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
        <Link href={`/materi/${bab}`} className="hover:text-blue-600 transition-colors">
          Materi Misi {bab}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Kuis</span>
      </nav>

      {/* Header Kuis */}
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-block rounded-md bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 mb-2">
          🎯 Kuis Pemahaman • {kuisData.soal.length} Soal Pilihan Ganda
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {kuisData.judul_kuis}
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Uji pemahaman konsepmu setelah mempelajari Misi {bab}.
        </p>
      </div>

      {/* Penanda Tahap */}
      <div className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-8 text-center">
        <span className="text-4xl">📝</span>
        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Sistem Kuis Interaktif
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
          Halaman ini akan diisi pada tahap berikutnya (Tahap 4) dengan fitur 1 soal per layar, opsi teracak, evaluasi instan, petunjuk, dan pembahasan mendalam.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/materi/${bab}`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px] flex items-center"
          >
            &larr; Kembali ke Materi Misi {bab}
          </Link>
        </div>
      </div>
    </div>
  );
}
