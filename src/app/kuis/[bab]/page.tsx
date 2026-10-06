import { notFound } from 'next/navigation';
import { getKuisDetail } from '@/lib/content';
import KuisClientWrapper from '@/components/kuis/KuisClientWrapper';
import KuisErrorView from '@/components/kuis/KuisErrorView';

interface Props {
  params: Promise<{
    bab: string;
  }>;
}

/**
 * Static Generation untuk 5 bab kuis agar langsung siap dimuat
 */
export function generateStaticParams() {
  return [
    { bab: '1' },
    { bab: '2' },
    { bab: '3' },
    { bab: '4' },
    { bab: '5' },
  ];
}

/**
 * Metadata halaman dinamis berdasarkan judul kuis
 */
export async function generateMetadata({ params }: Props) {
  const { bab } = await params;
  const result = getKuisDetail(bab);

  if (result.status !== 'success') {
    return {
      title: 'Kuis Pembelajaran — Pythonin',
      description: 'Uji pemahaman dasar pemrograman Python untuk siswa SMK RPL.',
    };
  }

  return {
    title: `${result.data.judul_kuis} — Pythonin`,
    description: `Uji pemahaman konsep Misi ${result.babNumber} dengan evaluasi instan dan pembahasan lengkap.`,
  };
}

/**
 * Halaman Kuis Interaktif Bab (Tahap 4).
 * Memuat konten kuis dari SSOT JSON di folder content/kuis-bab-X.json.
 * Menyediakan penanganan 404 untuk ID tidak valid dan tampilan error ramah
 * jika file tidak ditemukan atau sintaks JSON rusak.
 */
export default async function KuisDetailPage({ params }: Props) {
  const { bab } = await params;
  const result = getKuisDetail(bab);

  // Kebutuhan 8: Tampilkan 404 jika ID bab tidak ada / tidak valid (bukan 1..5)
  if (result.status === 'not-found') {
    notFound();
  }

  // Kebutuhan 8: Jika file JSON hilang atau rusak, tampilkan tampilan error yang ramah (tidak crash)
  if (result.status === 'file-not-found' || result.status === 'corrupt') {
    return (
      <KuisErrorView
        status={result.status}
        babNumber={result.babNumber}
        filename={result.filename}
        errorMessage={result.errorMessage}
      />
    );
  }

  // Kebutuhan 1 s.d. 7, 9: Render sistem kuis interaktif penuh
  return (
    <KuisClientWrapper
      kuisData={result.data}
      babNumber={result.babNumber}
    />
  );
}
