import { getAllContohMateri, getAllTantangan } from '@/lib/content';
import LatihanPageClient from '@/components/tantangan/LatihanPageClient';

export const metadata = {
  title: 'Tantangan Koding & Playground — Pythonin',
  description: 'Daftar tantangan koding berjenjang dengan cek otomatis dan area playground bebas Python.',
};

export default function LatihanPage() {
  const groups = getAllTantangan();
  const contohList = getAllContohMateri();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Header Halaman */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2.5">
          <span>⚡</span>
          <span>Eksekusi Python Langsung di Browser (Pyodide WebAssembly)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tantangan Koding & Latihan Mandiri
        </h1>
        <p className="mt-1.5 text-xs sm:text-base text-slate-600">
          Taklukkan 15 tantangan koding bertingkat dari Misi 1 hingga Misi 5 dengan evaluasi otomatis, petunjuk bertahap, dan pelacak progres.
        </p>
      </div>

      {/* Komponen Client Interaktif Tantangan & Playground */}
      <LatihanPageClient groups={groups} contohList={contohList} />
    </div>
  );
}
