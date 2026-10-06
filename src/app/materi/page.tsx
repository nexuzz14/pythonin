import { getAllBabSummaries } from '@/lib/content';
import ChapterCard from '@/components/materi/ChapterCard';

export const metadata = {
  title: 'Materi Pembelajaran — Pythonin',
  description: 'Daftar 5 bab materi dasar pemrograman Python untuk siswa SMK RPL.',
};

export default function MateriIndexPage() {
  const babList = getAllBabSummaries();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Halaman Materi */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-900 mb-3 border border-blue-200">
          <span>📚</span>
          <span>Kurikulum Lengkap 5 Misi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Materi Pembelajaran Python
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-2xl">
          Pilih misi belajar yang ingin kamu pelajari. Setiap bab dilengkapi penjelasan konsep, analogi dunia nyata, contoh kode langsung yang bisa dijalankan, dan latihan mandiri.
        </p>
      </div>

      {/* Grid 5 Kartu Materi Bab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {babList.map((bab) => (
          <ChapterCard key={bab.id} bab={bab} />
        ))}
      </div>
    </div>
  );
}
