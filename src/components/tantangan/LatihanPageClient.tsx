'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { TantanganBabGroup, ContohMateriItem } from '@/lib/content';
import type { ItemTantangan } from '@/types/content';
import TantanganList from './TantanganList';
import TantanganPanel from './TantanganPanel';
import CodePlayground from '@/components/editor/CodePlayground';

export interface LatihanPageClientProps {
  groups: TantanganBabGroup[];
  contohList: ContohMateriItem[];
}

function LatihanPageContent({ groups, contohList }: LatihanPageClientProps) {
  const searchParams = useSearchParams();

  const babParam = searchParams.get('bab');
  const idParam = searchParams.get('id');
  const initialBab = babParam ? parseInt(babParam, 10) : null;
  const initialId = idParam ? parseInt(idParam, 10) : null;
  const validInitialBab = initialBab && initialBab >= 1 && initialBab <= 5 ? initialBab : null;
  const validInitialId = validInitialBab && initialId && initialId >= 1 && initialId <= 3 ? initialId : null;

  const [activeTab, setActiveTab] = useState<'tantangan' | 'playground'>('tantangan');
  const [selectedBab, setSelectedBab] = useState<number | null>(validInitialBab);
  const [selectedId, setSelectedId] = useState<number | null>(validInitialId);

  // Playground selection
  const defaultContoh = contohList[0] || {
    id: 'default',
    label: 'Contoh',
    contoh_kode: 'print("Halo, dunia!")',
    output_contoh: 'Halo, dunia!',
  };
  const [selectedPlaygroundContoh, setSelectedPlaygroundContoh] = useState<ContohMateriItem>(defaultContoh);

  // Handler memilih tantangan
  const handleSelectChallenge = (babNum: number, challengeId: number) => {
    setSelectedBab(babNum);
    setSelectedId(challengeId);
    setActiveTab('tantangan');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update query params tanpa reload
    const url = new URL(window.location.href);
    url.searchParams.set('bab', String(babNum));
    url.searchParams.set('id', String(challengeId));
    window.history.pushState({}, '', url.toString());
  };

  // Handler kembali ke daftar
  const handleBackToList = () => {
    setSelectedBab(null);
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('bab');
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };

  // Temukan objek tantangan terpilih
  const activeChallengeData: { babNumber: number; babJudul: string; challenge: ItemTantangan } | null =
    selectedBab !== null && selectedId !== null
      ? (() => {
          const group = groups.find((g) => g.babNumber === selectedBab);
          if (!group) return null;
          const challenge = group.data.tantangan.find((t) => t.id === selectedId);
          if (!challenge) return null;
          return {
            babNumber: group.babNumber,
            babJudul: group.babJudul,
            challenge,
          };
        })()
      : null;

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Tantangan vs Playground Bebas */}
      <div className="flex rounded-2xl bg-slate-200/80 p-1.5 shadow-2xs self-start max-w-md">
        <button
          type="button"
          onClick={() => {
            setActiveTab('tantangan');
          }}
          className={`flex-1 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
            activeTab === 'tantangan'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🧩 Tantangan Koding</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('playground');
          }}
          className={`flex-1 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
            activeTab === 'playground'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>⚡ Playground Bebas</span>
        </button>
      </div>

      {/* Mode 1: Tantangan Koding */}
      {activeTab === 'tantangan' && (
        <div>
          {activeChallengeData ? (
            <TantanganPanel
              key={`${activeChallengeData.babNumber}-${activeChallengeData.challenge.id}`}
              babNumber={activeChallengeData.babNumber}
              babJudul={activeChallengeData.babJudul}
              challenge={activeChallengeData.challenge}
              totalChallengesInBab={3}
              onBackToList={handleBackToList}
              onSelectChallenge={(newId) =>
                handleSelectChallenge(activeChallengeData.babNumber, newId)
              }
            />
          ) : (
            <TantanganList
              groups={groups}
              onSelectChallenge={handleSelectChallenge}
            />
          )}
        </div>
      )}

      {/* Mode 2: Playground Bebas */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          {/* Pengatur Dropdown Contoh Materi */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label
                  htmlFor="pilih-contoh-materi"
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
                  id="pilih-contoh-materi"
                  value={selectedPlaygroundContoh.id}
                  onChange={(e) => {
                    const found = contohList.find((item) => item.id === e.target.value);
                    if (found) setSelectedPlaygroundContoh(found);
                  }}
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

          <CodePlayground
            key={selectedPlaygroundContoh.id}
            initialCode={selectedPlaygroundContoh.contoh_kode}
            expectedOutput={selectedPlaygroundContoh.output_contoh}
            title={selectedPlaygroundContoh.label}
            subtitle={`Contoh kode dari ${selectedPlaygroundContoh.babJudul || 'Materi'}`}
          />
        </div>
      )}
    </div>
  );
}

export default function LatihanPageClient(props: LatihanPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-center">
            <span className="text-3xl animate-bounce block mb-2">🧩</span>
            <p className="text-sm font-semibold text-slate-600">Memuat tantangan...</p>
          </div>
        </div>
      }
    >
      <LatihanPageContent {...props} />
    </Suspense>
  );
}
