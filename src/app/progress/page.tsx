import { getAllBabSummaries, getAllTantangan } from '@/lib/content';
import ProgressClientView from '@/components/progress/ProgressClientView';

export const metadata = {
  title: 'Progress Belajar — Pythonin',
  description: 'Ringkasan persentase penyelesaian keseluruhan, status per bab, skor kuis, dan tantangan yang selesai.',
};

export default function ProgressPage() {
  const babList = getAllBabSummaries();
  const tantanganGroups = getAllTantangan();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-5 mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2.5">
          <span>📊</span>
          <span>Dasbor Pembelajaran Mandiri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Progress Belajar Python
        </h1>
        <p className="mt-1.5 text-xs sm:text-base text-slate-600">
          Pantau pencapaian belajarmu di 5 misi: status materi yang dibaca, tantangan koding yang ditaklukkan, dan hasil kuis pemahaman.
        </p>
      </div>

      {/* Komponen Client Interaktif Progress */}
      <ProgressClientView babList={babList} tantanganGroups={tantanganGroups} />
    </div>
  );
}
