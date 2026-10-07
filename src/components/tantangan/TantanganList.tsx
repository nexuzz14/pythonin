'use client';

import React, { useState, useMemo } from 'react';
import type { TantanganBabGroup } from '@/lib/content';
import { useProgress } from '@/lib/progress';
import TantanganCard from './TantanganCard';

export interface TantanganListProps {
  groups: TantanganBabGroup[];
  onSelectChallenge: (babNumber: number, challengeId: number) => void;
  className?: string;
}

export default function TantanganList({
  groups,
  onSelectChallenge,
  className = '',
}: TantanganListProps) {
  const { progress, getChallengeStatus, stats } = useProgress();

  const [filterBab, setFilterBab] = useState<number | 'all'>('all');
  const [filterTingkat, setFilterTingkat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter kelompok bab dan tantangan
  const filteredGroups = useMemo(() => {
    return groups
      .filter((g) => (filterBab === 'all' ? true : g.babNumber === filterBab))
      .map((g) => {
        const matchingChallenges = g.data.tantangan.filter((t) => {
          // Filter tingkat
          if (filterTingkat !== 'all' && t.tingkat !== filterTingkat) {
            return false;
          }

          // Filter status
          if (filterStatus !== 'all') {
            const st = getChallengeStatus(g.babNumber, t.id);
            if (st !== filterStatus) return false;
          }

          return true;
        });

        return {
          ...g,
          filteredChallenges: matchingChallenges,
        };
      })
      .filter((g) => g.filteredChallenges.length > 0);
  }, [groups, filterBab, filterTingkat, filterStatus, getChallengeStatus]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Banner Progres Ringkas Tantangan */}
      <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl shadow-sm">
              🧩
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Tantangan Koding Terpadu
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Uji langsung kemampuan kodingmu dengan 15 tantangan interaktif berjenjang.
              </p>
            </div>
          </div>

          {/* Indikator Progres Tantangan */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Progres Tantangan</span>
              <span className="text-sm font-extrabold text-blue-600">
                {stats.passedChallenges} dari {stats.totalChallenges} Selesai
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {Math.round((stats.passedChallenges / (stats.totalChallenges || 15)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Kontrol Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-1">🔍 Filter:</span>

            {/* Filter Bab */}
            <select
              value={filterBab}
              onChange={(e) =>
                setFilterBab(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              aria-label="Pilih Bab"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="all">Semua Misi (1-5)</option>
              {groups.map((g) => (
                <option key={g.babNumber} value={g.babNumber}>
                  Misi {g.babNumber}
                </option>
              ))}
            </select>

            {/* Filter Tingkat */}
            <select
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
              aria-label="Pilih Tingkat Kesulitan"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none min-h-[38px] cursor-pointer"
            >
              <option value="all">Semua Tingkat</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </select>
          </div>

          {/* Filter Status Tab */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start md:self-auto">
            {(['all', 'belum', 'dicoba', 'selesai'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filterStatus === st
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all'
                  ? 'Semua Status'
                  : st === 'belum'
                  ? 'Belum'
                  : st === 'dicoba'
                  ? 'Dicoba'
                  : 'Selesai'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Tantangan Dikelompokkan Per Bab */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-10">
          {filteredGroups.map((group) => {
            // Hitung statistik lolos pada bab ini
            const babChallenges = group.data.tantangan;
            const passedInBab = babChallenges.filter(
              (t) => getChallengeStatus(group.babNumber, t.id) === 'selesai'
            ).length;

            return (
              <section
                key={group.babNumber}
                className="space-y-4"
                aria-labelledby={`heading-bab-${group.babNumber}`}
              >
                {/* Header Bab */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-blue-800">
                      Misi {group.babNumber}
                    </span>
                    <h3
                      id={`heading-bab-${group.babNumber}`}
                      className="text-base sm:text-lg font-bold text-slate-900"
                    >
                      {group.babJudul}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    {passedInBab} dari {babChallenges.length} Selesai
                  </span>
                </div>

                {/* Grid Kartu Tantangan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.filteredChallenges.map((ch) => {
                    const st = getChallengeStatus(group.babNumber, ch.id);
                    const chalData =
                      progress.chapters[`bab-${group.babNumber}`]?.challenges?.[String(ch.id)];

                    return (
                      <TantanganCard
                        key={ch.id}
                        babNumber={group.babNumber}
                        challenge={ch}
                        status={st}
                        attempts={chalData?.attempts ?? 0}
                        hintsUsed={chalData?.hintsUsed ?? 0}
                        onSelect={onSelectChallenge}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <span className="text-3xl block mb-2">🔍</span>
          <h3 className="text-base font-bold text-slate-900">
            Tidak ada tantangan yang cocok
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
            Tidak ditemukan tantangan yang sesuai dengan filter yang kamu pilih. Coba atur ulang filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterBab('all');
              setFilterTingkat('all');
              setFilterStatus('all');
            }}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Penjelasan UI Bahwa Data Tersimpan di Browser (Kebutuhan 11) */}
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-600">
        <span className="text-base shrink-0" aria-hidden="true">🔒</span>
        <p className="leading-relaxed">
          Kemajuan tantangan koding tersimpan secara lokal di browser perangkat ini (tanpa perlu login).
        </p>
      </div>
    </div>
  );
}
