'use client';

import React, { useState } from 'react';
import CodePlayground from '@/components/editor/CodePlayground';
import type { ContohMateriItem } from '@/lib/content';

interface LatihanClientProps {
  contohList: ContohMateriItem[];
}

export default function LatihanClient({ contohList }: LatihanClientProps) {
  // Pilihan awal dari contoh pertama Bab 1 (konten nyata)
  const defaultContoh = contohList[0] || {
    id: 'default',
    label: 'Contoh',
    contoh_kode: 'print("Halo, dunia!")',
    output_contoh: 'Halo, dunia!',
  };

  const [selectedId, setSelectedId] = useState<string>(defaultContoh.id);
  const [currentContoh, setCurrentContoh] = useState<ContohMateriItem>(defaultContoh);

  const handleSelectContoh = (id: string) => {
    setSelectedId(id);
    const found = contohList.find((item) => item.id === id);
    if (found) {
      setCurrentContoh(found);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Pengatur Dropdown Contoh Materi */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label
              htmlFor="pilih-contoh"
              className="text-xs sm:text-sm font-bold text-slate-900 block"
            >
              📖 Muat Contoh dari Materi:
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih contoh kode nyata dari Bab 1 hingga Bab 5 untuk dicoba langsung di playground.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              id="pilih-contoh"
              value={selectedId}
              onChange={(e) => handleSelectContoh(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-h-[44px]"
            >
              {contohList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor Playground Utama */}
      <CodePlayground
        key={currentContoh.id}
        initialCode={currentContoh.contoh_kode}
        expectedOutput={currentContoh.output_contoh}
        title={currentContoh.label}
        subtitle={`Contoh kode dari ${currentContoh.babJudul || 'Materi'}`}
      />

      {/* Penanda / Placeholder Daftar Tantangan (Tahap 5) */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-700 mb-3">
          🧩
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Daftar Tantangan Koding Terpadu
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Pada Tahap 5, seluruh tantangan dari Misi 1 sampai Misi 5 beserta status penyelesaiannya akan dapat diakses langsung dari panel ini.
        </p>
      </div>
    </div>
  );
}
