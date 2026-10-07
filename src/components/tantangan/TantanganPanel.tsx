'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { ItemTantangan } from '@/types/content';
import { pyodideRunner } from '@/lib/pyodide/runner';
import { formatFriendlyError } from '@/lib/error-friendly';
import { evaluateChallengeOutput, type ChallengeCheckResult } from '@/lib/challenge-checker';
import { useProgress } from '@/lib/progress';
import type { FriendlyError, RunnerStatus } from '@/types/runner';
import SymbolBar from '@/components/editor/SymbolBar';
import OutputPanel from '@/components/editor/OutputPanel';
import ErrorPanel from '@/components/editor/ErrorPanel';
import OutputDiffViewer from './OutputDiffViewer';
import HintSection from './HintSection';

const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-mono text-xs sm:text-sm">
      <span className="animate-pulse">Menyiapkan editor kode...</span>
    </div>
  ),
});

export interface TantanganPanelProps {
  babNumber: number;
  babJudul: string;
  challenge: ItemTantangan;
  totalChallengesInBab?: number;
  onBackToList?: () => void;
  onSelectChallenge?: (id: number) => void;
  className?: string;
}

export default function TantanganPanel({
  babNumber,
  babJudul,
  challenge,
  totalChallengesInBab = 3,
  onBackToList,
  onSelectChallenge,
  className = '',
}: TantanganPanelProps) {
  const { progress, updateChallengeAttempt, getChallengeStatus } = useProgress();

  const [code, setCode] = useState<string>(challenge.kode_awal);
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus>('loading');
  const [actionStatus, setActionStatus] = useState<'idle' | 'running' | 'checking'>('idle');

  // Output dan Hasil Run biasa
  const [stdout, setStdout] = useState<string>('');
  const [friendlyError, setFriendlyError] = useState<FriendlyError | null>(null);

  // Hasil Pengecekan Tantangan
  const [checkResult, setCheckResult] = useState<ChallengeCheckResult | null>(null);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [hintsUnlockedCount, setHintsUnlockedCount] = useState<number>(0);
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null);

  const insertSymbolRef = useRef<((symbol: string) => void) | null>(null);

  // Cek status tersimpan saat ini dari storage
  const currentStatus = getChallengeStatus(babNumber, challenge.id);
  const storedChallenge = progress.chapters[`bab-${babNumber}`]?.challenges?.[String(challenge.id)];

  // Subscribe ke status Pyodide runner
  useEffect(() => {
    const unsubscribe = pyodideRunner.subscribe((status) => {
      setRunnerStatus(status);
    });
    pyodideRunner.init();
    return () => {
      unsubscribe();
    };
  }, []);

  // Handler Tombol "Jalankan" (Run bebas tanpa evaluasi)
  const handleRun = async () => {
    setStdout('');
    setFriendlyError(null);
    setCheckResult(null);
    setTimeoutMessage(null);
    setActionStatus('running');

    try {
      const result = await pyodideRunner.runCode(code);
      setStdout(result.stdout || '');

      if (result.error) {
        if (result.error.type === 'Timeout') {
          setTimeoutMessage(
            'Waktu eksekusi habis (lebih dari 5 detik). Kemungkinan ada perulangan tak berujung (infinite loop).'
          );
        } else {
          setFriendlyError(formatFriendlyError(result.error, code));
        }
      }
    } catch (err) {
      setFriendlyError(formatFriendlyError(err instanceof Error ? err.message : String(err), code));
    } finally {
      setActionStatus('idle');
    }
  };

  // Handler Tombol "Periksa Jawaban" (Evaluasi otomatis vs output_diharapkan)
  const handleCheck = async () => {
    setStdout('');
    setFriendlyError(null);
    setCheckResult(null);
    setTimeoutMessage(null);
    setActionStatus('checking');

    try {
      const result = await pyodideRunner.runCode(code);
      setStdout(result.stdout || '');

      if (result.error) {
        if (result.error.type === 'Timeout') {
          setTimeoutMessage(
            '⏱️ Waktu Eksekusi Habis (Timeout > 5 detik): Programmu berhenti karena berjalan terlalu lama. Periksa perulangan while/for dan pastikan kondisi berhenti tercapai.'
          );
          // Jangan loloskan jika timeout
          updateChallengeAttempt(babNumber, challenge.id, false, hintsUnlockedCount);
        } else {
          setFriendlyError(formatFriendlyError(result.error, code));
          // Error runtime tidak meloloskan tantangan
          updateChallengeAttempt(babNumber, challenge.id, false, hintsUnlockedCount);
        }
      } else {
        // Eksekusi sukses, lakukan normalisasi & evaluasi output
        const evalRes = evaluateChallengeOutput(result.stdout || '', challenge.output_diharapkan);
        setCheckResult(evalRes);

        if (evalRes.isCorrect) {
          setIsPassed(true);
          updateChallengeAttempt(babNumber, challenge.id, true, hintsUnlockedCount);
        } else {
          setIsPassed(false);
          updateChallengeAttempt(babNumber, challenge.id, false, hintsUnlockedCount);
        }
      }
    } catch (err) {
      setFriendlyError(formatFriendlyError(err instanceof Error ? err.message : String(err), code));
      updateChallengeAttempt(babNumber, challenge.id, false, hintsUnlockedCount);
    } finally {
      setActionStatus('idle');
    }
  };

  const handleResetCode = () => {
    setCode(challenge.kode_awal);
    setStdout('');
    setFriendlyError(null);
    setCheckResult(null);
    setTimeoutMessage(null);
  };

  const handleHintUnlocked = (newCount: number) => {
    setHintsUnlockedCount(newCount);
    updateChallengeAttempt(babNumber, challenge.id, isPassed, newCount);
  };

  const isExecuting = actionStatus !== 'idle';
  const isPyodideLoading = runnerStatus === 'loading';

  const badgeLevelColor =
    challenge.tingkat === 'mudah'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : challenge.tingkat === 'sedang'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Baris Navigasi Header Tantangan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition min-h-[44px]"
            >
              <span>&larr;</span>
              <span>Daftar Tantangan</span>
            </button>
          )}
          <span className="text-xs text-slate-500 font-medium">
            Misi {babNumber}: {babJudul}
          </span>
        </div>

        {/* Switcher Tantangan 1..3 */}
        {onSelectChallenge && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600 mr-1">Tantangan:</span>
            {Array.from({ length: totalChallengesInBab }, (_, i) => i + 1).map((num) => {
              const active = num === challenge.id;
              const isChPassed = getChallengeStatus(babNumber, num) === 'selesai';
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onSelectChallenge(num)}
                  className={`min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs scale-105'
                      : isChPassed
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-label={`Buka Tantangan ${num}`}
                >
                  {isChPassed && !active ? '✓' : num}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Header Utama Info Tantangan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-800">
              Misi {babNumber} — Tantangan #{challenge.id}
            </span>
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${badgeLevelColor}`}>
              {challenge.tingkat}
            </span>
          </div>

          {/* Status Badge Tantangan */}
          <div>
            {isPassed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                <span>✅</span> Selesai
              </span>
            ) : currentStatus === 'dicoba' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                <span>⏳</span> Sedang Dicoba ({storedChallenge?.attempts || 0}x)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Belum Mulai
              </span>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {challenge.judul}
        </h2>

        {/* Cerita / Skenario Siswa SMK */}
        <div className="mt-4 rounded-xl border border-blue-200/90 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <span>📖</span>
            <span>Skenario Cerita:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {challenge.cerita}
          </p>
        </div>

        {/* Instruksi Pengerjaan */}
        <div className="mt-4 space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            🎯 Tugas & Instruksi:
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            {challenge.instruksi}
          </p>
        </div>

        {/* Target Output yang Diharapkan (Preview Box) */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span>🎯</span> Target Output yang Diharapkan:
            </span>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-emerald-300 whitespace-pre">
              {challenge.output_diharapkan}
            </pre>
          </div>
        </div>

        {/* Jebakan / Kesalahan Umum */}
        {challenge.kesalahan_umum && challenge.kesalahan_umum.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 text-xs text-amber-950">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
              <span>⚠️</span> Jebakan yang Perlu Diwaspadai:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              {challenge.kesalahan_umum.map((errTip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {errTip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Area Editor Kode */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>🐍</span> Editor Kode Siswa
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetCode}
              disabled={isExecuting}
              className="inline-flex items-center justify-center text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-2 rounded-xl border border-slate-700 hover:border-slate-500 min-h-[44px] cursor-pointer"
              title="Kembalikan ke kode awal"
            >
              🔄 Reset Kode
            </button>
          </div>
        </div>

        {/* SymbolBar untuk pengguna HP */}
        <div className="mb-2">
          <SymbolBar onInsert={(sym: string) => insertSymbolRef.current?.(sym)} />
        </div>

        {/* Code Editor */}
        <div className="overflow-hidden rounded-xl border border-slate-700 focus-within:border-blue-500 transition-colors">
          <CodeEditor
            key={`${challenge.id}-${challenge.kode_awal}`}
            initialCode={code}
            onChange={setCode}
            onInsertSymbolRef={insertSymbolRef}
          />
        </div>

        {/* Baris Tombol Aksi: Jalankan & Periksa Jawaban */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {/* Tombol Jalankan Bebas */}
            <button
              type="button"
              onClick={handleRun}
              disabled={isExecuting || isPyodideLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-700 active:scale-[0.98] transition disabled:opacity-50 min-h-[44px]"
            >
              <span>{actionStatus === 'running' ? '⏳ Menjalankan...' : '▶ Jalankan'}</span>
            </button>

            {/* Tombol Utama: Periksa Jawaban */}
            <button
              type="button"
              onClick={handleCheck}
              disabled={isExecuting || isPyodideLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50 min-h-[44px]"
            >
              <span>
                {actionStatus === 'checking'
                  ? '🔍 Memeriksa...'
                  : isPyodideLoading
                  ? 'Menyiapkan Python...'
                  : '✅ Periksa Jawaban'}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {runnerStatus === 'ready' ? (
              <span className="text-emerald-400">● Python Siap</span>
            ) : runnerStatus === 'loading' ? (
              <span className="text-amber-400 animate-pulse">● Menyiapkan...</span>
            ) : (
              <span className="text-slate-400">● Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* Hasil Evaluasi & Feedback Pengecekan */}
      <div aria-live="polite" className="space-y-4">
        {/* Kasus 1: Lolos Berhasil (Kartu Hijau) */}
        {checkResult && checkResult.isCorrect && (
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-5 sm:p-6 shadow-md animate-celebrate">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white text-2xl shadow-sm">
                  🎉
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-950">
                    Luar Biasa! Jawabanmu Benar!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                    Output kodemu cocok 100% dengan target yang diharapkan. Kemajuan belajarmu telah tersimpan.
                  </p>
                </div>
              </div>

              {/* Tombol Lanjut ke Tantangan Berikutnya jika ada */}
              {onSelectChallenge && challenge.id < totalChallengesInBab && (
                <button
                  type="button"
                  onClick={() => onSelectChallenge(challenge.id + 1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition min-h-[44px] shrink-0"
                >
                  <span>Lanjut ke Tantangan #{challenge.id + 1}</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Kasus 2: Hasil Tidak Cocok (Kartu Salah + Diff Viewer) */}
        {checkResult && !checkResult.isCorrect && (
          <OutputDiffViewer
            studentOutput={checkResult.normalizedStudent}
            expectedOutput={checkResult.normalizedExpected}
            lineDiffs={checkResult.lineDiffs}
            diffSummary={checkResult.diffSummary}
          />
        )}

        {/* Kasus 3: Timeout Error */}
        {timeoutMessage && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3 text-amber-900">
              <span className="text-2xl shrink-0" aria-hidden="true">⏱️</span>
              <div>
                <h4 className="text-sm sm:text-base font-bold">Waktu Eksekusi Habis (Timeout)</h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  {timeoutMessage}
                </p>
                <p className="text-xs text-amber-700 mt-2 font-semibold">
                  💡 Tips: Pastikan loop memiliki kondisi berhenti yang benar dan variabel counter bertambah di setiap putaran.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kasus 4: Error Python */}
        {friendlyError && (
          <ErrorPanel error={friendlyError} />
        )}

        {/* Kasus 5: Output Run Biasa (Ketika siswa klik "Jalankan", bukan "Periksa") */}
        {!checkResult && stdout && (
          <OutputPanel stdout={stdout} isRunning={actionStatus === 'running'} onClear={() => setStdout('')} />
        )}
      </div>

      {/* Bagian Petunjuk Bertahap & Contoh Solusi */}
      <HintSection
        petunjuk={challenge.petunjuk}
        contohSolusi={challenge.contoh_solusi}
        initialHintsUnlocked={hintsUnlockedCount}
        onHintUnlocked={handleHintUnlocked}
      />
    </div>
  );
}
