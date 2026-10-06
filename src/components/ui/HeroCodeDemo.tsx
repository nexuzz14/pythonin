'use client';

import React, { useState, useEffect, useRef } from 'react';

interface HeroCodeDemoProps {
  contohKode: string;
  outputContoh: string;
}

export default function HeroCodeDemo({
  contohKode,
  outputContoh,
}: HeroCodeDemoProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedOutput, setHasStartedOutput] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const triggerShowOutput = () => {
    setActiveTab('output');
    setHasStartedOutput(true);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // Periksa preferensi prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedOutput(outputContoh);
      setIsTyping(false);
      return;
    }

    // Animasi mengetik singkat
    setIsTyping(true);
    setDisplayedOutput('');

    let currentIndex = 0;
    const textLength = outputContoh.length;

    typingTimerRef.current = setInterval(() => {
      currentIndex += 2; // kecepatan 2 karakter per tick agar responsif (~400ms total)
      if (currentIndex >= textLength) {
        setDisplayedOutput(outputContoh);
        setIsTyping(false);
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
      } else {
        setDisplayedOutput(outputContoh.slice(0, currentIndex));
      }
    }, 20);
  };

  const codeLines = contohKode.split('\n');

  return (
    <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-900 shadow-xl overflow-hidden text-left font-mono">
      {/* Editor Window Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5 gap-2">
        {/* macOS / Linux Window Controls & File Tab */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-rose-500/90 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-400/90 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 ml-1">
            <span className="text-blue-400 font-bold">#</span> misi1_halo.py
          </span>
        </div>

        {/* Tab Switcher (Kode Python vs Contoh Hasil) */}
        <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'code'}
            onClick={() => setActiveTab('code')}
            className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kode Python
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'output'}
            onClick={() => {
              if (!hasStartedOutput) {
                triggerShowOutput();
              } else {
                setActiveTab('output');
              }
            }}
            className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'output'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Contoh Hasil
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 text-sm sm:text-base leading-relaxed overflow-x-auto min-h-[200px]">
        {activeTab === 'code' ? (
          <div>
            <div className="space-y-1">
              {codeLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="w-5 select-none text-right text-xs text-slate-600 font-mono pt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-slate-200 font-mono">
                    {line.startsWith('print') ? (
                      <>
                        <span className="text-blue-400 font-semibold">print</span>
                        <span className="text-slate-300">(</span>
                        <span className="text-emerald-300">
                          {line.slice(line.indexOf('(') + 1, line.lastIndexOf(')'))}
                        </span>
                        <span className="text-slate-300">)</span>
                      </>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Interaksi Coba Lihat Hasil */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-sans">
                💡 Penasaran bagaimana hasilnya saat dijalankan?
              </span>
              <button
                type="button"
                onClick={triggerShowOutput}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 transition min-h-[44px] shadow-sm active:scale-95"
              >
                <span>Lihat contoh hasil</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Contoh hasil dari Misi 1
              </span>
              <button
                type="button"
                onClick={triggerShowOutput}
                disabled={isTyping}
                className="text-xs text-slate-400 hover:text-blue-300 transition underline underline-offset-4 min-h-[44px] flex items-center px-1"
              >
                Ketik ulang hasil
              </button>
            </div>

            {/* Output Display */}
            <div className="rounded-lg bg-slate-950 p-3 sm:p-4 text-emerald-400 text-xs sm:text-sm whitespace-pre-wrap font-mono min-h-[80px]">
              {displayedOutput ? (
                <>
                  {displayedOutput}
                  {isTyping && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse align-middle" />
                  )}
                </>
              ) : (
                <span className="text-slate-500 italic">Memuat hasil...</span>
              )}
            </div>

            {/* Catatan Edukatif */}
            <p className="text-xs text-slate-400 font-sans leading-normal pt-1">
              📌 <strong className="text-slate-300">Catatan:</strong> Menjalankan dan mengedit kode sungguhan tersedia di halaman materi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
