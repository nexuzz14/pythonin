import { getAllContohMateri } from '@/lib/content';
import LatihanClient from '@/components/editor/LatihanClient';

export const metadata = {
  title: 'Latihan & Playground — Pythonin',
  description: 'Area latihan bebas dan playground eksekusi kode Python di browser.',
};

export default function LatihanPage() {
  const contohList = getAllContohMateri();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Header Halaman */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2.5">
          <span>⚡</span>
          <span>Engine Pyodide WebAssembly</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Latihan & Playground Python
        </h1>
        <p className="mt-1.5 text-xs sm:text-base text-slate-600">
          Uji coba kode Pythonmu secara langsung di browser tanpa instalasi. Coba contoh materi atau ketik kodemu sendiri.
        </p>
      </div>

      {/* Komponen Client Interaktif */}
      <LatihanClient contohList={contohList} />
    </div>
  );
}
