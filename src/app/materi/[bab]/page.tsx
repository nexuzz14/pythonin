import { notFound } from 'next/navigation';
import { getBabDetail } from '@/lib/content';
import MateriClientWrapper from '@/components/materi/MateriClientWrapper';
import MateriErrorView from '@/components/materi/MateriErrorView';

interface Props {
  params: Promise<{
    bab: string;
  }>;
}

/**
 * Static Generation untuk 5 bab materi agar cepat dimuat
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
 * Metadata halaman dinamis berdasarkan judul dan ringkasan bab
 */
export async function generateMetadata({ params }: Props) {
  const { bab } = await params;
  const result = getBabDetail(bab);

  if (result.status !== 'success') {
    return {
      title: 'Materi Pembelajaran — Pythonin',
      description: 'Materi dasar pemrograman Python untuk siswa SMK RPL.',
    };
  }

  return {
    title: `Misi ${result.babNumber}: ${result.data.judul} — Pythonin`,
    description: result.data.ringkasan,
  };
}

/**
 * Halaman Materi Bab (Tahap 3).
 * Memuat konten bab dari SSOT JSON di folder content/bab-X.json.
 * Menyediakan penanganan 404 untuk ID tidak valid dan halaman error ramah
 * jika file tidak ditemukan atau sintaks rusak.
 */
export default async function MateriDetailPage({ params }: Props) {
  const { bab } = await params;
  const result = getBabDetail(bab);

  // Kebutuhan 5: Tampilkan 404 jika ID bab tidak ada / tidak valid
  if (result.status === 'not-found') {
    notFound();
  }

  // Kebutuhan 5: Jika file JSON tidak ada atau rusak, tampilkan halaman error yang ramah (bukan crash)
  if (result.status === 'file-not-found' || result.status === 'corrupt') {
    return (
      <MateriErrorView
        status={result.status}
        babNumber={result.babNumber}
        filename={result.filename}
        errorMessage={result.errorMessage}
      />
    );
  }

  // Kebutuhan 2, 3, 4, 6, 7, 8: Render materi lengkap
  return (
    <MateriClientWrapper
      babData={result.data}
      babNumber={result.babNumber}
    />
  );
}
