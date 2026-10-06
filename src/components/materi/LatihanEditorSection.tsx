import React from 'react';
import type { LatihanEditor } from '@/types/content';
import CodePlayground from '@/components/editor/CodePlayground';

export interface LatihanEditorSectionProps {
  latihan: LatihanEditor;
  babNomor: number;
  className?: string;
}

/**
 * Komponen Latihan Editor Mandiri (Single Responsibility).
 * Menampilkan instruksi latihan akhir bab, live code editor dengan starter code nyata,
 * serta target output yang diharapkan untuk diuji siswa.
 */
export default function LatihanEditorSection({
  latihan,
  babNomor,
  className = '',
}: LatihanEditorSectionProps) {
  return (
    <section
      id="latihan-editor"
      className={`scroll-mt-24 space-y-4 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 p-5 sm:p-7 shadow-xs ${className}`}
      aria-labelledby="heading-latihan-editor"
    >
      {/* Header Latihan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-xl shadow-xs"
            aria-hidden="true"
          >
            💻
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                Praktik Mandiri Misi {babNomor}
              </span>
            </div>
            <h3
              id="heading-latihan-editor"
              className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5"
            >
              Latihan Editor: Uji Kemampuanmu
            </h3>
          </div>
        </div>
      </div>

      {/* Instruksi Latihan */}
      <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">
          <span>📋</span>
          <span>Instruksi Latihan:</span>
        </div>
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
          {latihan.instruksi}
        </p>
      </div>

      {/* Live Code Playground dengan Starter Code dan Expected Output */}
      <CodePlayground
        initialCode={latihan.kode_awal}
        expectedOutput={latihan.output_diharapkan}
        title={`Editor Latihan Bab ${babNomor}`}
        subtitle="Ubah kode di bawah ini hingga hasil cetaknya sama persis dengan target output di bawah!"
      />

      {/* Catatan Bantuan Siswa */}
      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-600 shadow-2xs">
        <span className="text-base shrink-0" aria-hidden="true">💡</span>
        <p className="leading-relaxed">
          Jangan ragu untuk menekan tombol <strong className="font-semibold text-slate-900">Reset</strong> jika ingin kembali ke kode awal. Setelah berhasil, lanjut uji pemahamanmu di menu Kuis!
        </p>
      </div>
    </section>
  );
}
