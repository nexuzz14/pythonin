'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import type { BabMateri } from '@/types/content';
import { useReadSections } from '@/lib/read-progress';
import { markChapterOpened } from '@/lib/progress';
import ObjectiveCard from './ObjectiveCard';
import BagianMateri from './BagianMateri';
import LatihanEditorSection from './LatihanEditorSection';
import PoinPenting from './PoinPenting';
import DaftarIstilah from './DaftarIstilah';
import DaftarIsiNav from './DaftarIsiNav';
import NavigasiBab from './NavigasiBab';

export interface MateriClientWrapperProps {
  babData: BabMateri;
  babNumber: number;
}

/**
 * Komponen Pembungkus Klien Halaman Materi (Single Responsibility).
 * Mengelola state penanda bagian yang sudah dibaca (disimpan di state & disinkronkan ke localStorage),
 * serta menyusun alur komponen secara runtut sesuai spesifikasi.
 */
export default function MateriClientWrapper({
  babData,
  babNumber,
}: MateriClientWrapperProps) {
  const { readSections, toggleRead } = useReadSections(babNumber);

  useEffect(() => {
    markChapterOpened(babNumber);
  }, [babNumber]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Breadcrumb Navigasi */}
      <nav className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/materi" className="hover:text-blue-600 transition-colors">
          Materi
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Misi {babNumber}</span>
      </nav>

      {/* Header Utama Bab: 1. Judul */}
      <header className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
            Misi {babNumber}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            ⏱️ Durasi ± {babData.durasi_menit} Menit
          </span>
          <span className="text-xs text-slate-500">
            • {babData.bagian.length} Topik Pembahasan
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {babData.judul}
        </h1>
      </header>

      {/* Tata Letak Konten: Sidebar Navigasi Cepat & Badan Materi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kanan / Atas di Mobile: Daftar Isi & Jump-Link */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 order-1 lg:order-2">
          <DaftarIsiNav
            bagianList={babData.bagian}
            readSections={readSections}
          />
        </aside>

        {/* Kolom Utama: Konten Berurutan */}
        <main className="lg:col-span-8 space-y-10 order-2 lg:order-1">
          {/* 2. Tujuan Belajar, 3. Prasyarat, & 4. Ringkasan */}
          <ObjectiveCard
            tujuan={babData.tujuan}
            prasyarat={babData.prasyarat}
            ringkasan={babData.ringkasan}
          />

          {/* 5. Tiap Bagian Materi Lengkap */}
          <section className="space-y-8" aria-label="Bagian Materi Pembelajaran">
            {babData.bagian.map((bagian, index) => (
              <BagianMateri
                key={bagian.id}
                bagian={bagian}
                nomorBagian={index + 1}
                totalBagian={babData.bagian.length}
                isRead={readSections.has(bagian.id)}
                onToggleRead={() => toggleRead(bagian.id)}
              />
            ))}
          </section>

          {/* 6. Latihan Editor Akhir Bab */}
          <LatihanEditorSection
            latihan={babData.latihan_editor}
            babNomor={babNumber}
          />

          {/* 7. Poin Penting Misi Ini */}
          <PoinPenting poinPenting={babData.poin_penting} />

          {/* 8. Daftar Istilah & Glosarium */}
          <DaftarIstilah istilah={babData.istilah} />

          {/* Navigasi Bawah: Bab Sebelumnya, Berikutnya, dan Kuis */}
          <NavigasiBab currentBab={babNumber} totalBab={5} />
        </main>
      </div>
    </div>
  );
}
