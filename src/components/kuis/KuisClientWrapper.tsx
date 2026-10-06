'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { KuisBab, SoalKuis, TingkatKesulitan } from '@/types/content';
import type {
  SoalTersusun,
  OpsiTersusun,
  JawabanSiswa,
  HasilKuis,
  RincianKesulitan,
  SoalSalahReview,
} from '@/types/kuis';
import { saveQuizResult } from '@/lib/quiz-progress';
import KuisIntroView from './KuisIntroView';
import KuisQuestionView from './KuisQuestionView';
import KuisResultView from './KuisResultView';

export interface KuisClientWrapperProps {
  kuisData: KuisBab;
  babNumber: number;
  /**
   * Callback yang dipanggil saat kuis selesai dikerjakan (Kebutuhan 9).
   * Memudahkan integrasi ke sistem pelacakan progres di Tahap 5.
   */
  onFinish?: (skor: number, total: number, hasil: HasilKuis) => void;
}

/**
 * Mengacak urutan elemen dalam array tanpa mengubah array asli (Fisher-Yates shuffle).
 */
function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Menyusun daftar soal dan opsi dengan pemetaan indeks asli.
 */
function prepareQuestions(
  soalList: readonly SoalKuis[],
  acak: boolean
): SoalTersusun[] {
  return soalList.map((soal) => {
    const opsiMapped: OpsiTersusun[] = soal.opsi.map((teks, idx) => ({
      teks,
      indeksAsli: idx,
    }));

    return {
      soal,
      opsi: acak ? shuffleArray(opsiMapped) : opsiMapped,
    };
  });
}

/**
 * Komponen Utama Interaktif Kuis Bab (Client Component).
 * Mengelola seluruh alur:
 * Layar Pembuka → Soal satu per satu → Umpan balik & Pembahasan → Layar Hasil.
 */
export default function KuisClientWrapper({
  kuisData,
  babNumber,
  onFinish,
}: KuisClientWrapperProps) {
  const [phase, setPhase] = useState<'intro' | 'question' | 'result'>('intro');
  const [acakOpsi, setAcakOpsi] = useState<boolean>(true);
  const [questions, setQuestions] = useState<SoalTersusun[]>(() =>
    prepareQuestions(kuisData.soal, true)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOriginalIndex, setSelectedOriginalIndex] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  const [jawabanList, setJawabanList] = useState<JawabanSiswa[]>([]);
  const [hasilAkhir, setHasilAkhir] = useState<HasilKuis | null>(null);

  const totalSoal = questions.length;
  const currentItem = questions[currentIndex];

  // Inisialisasi atau acak ulang soal saat mulai
  const handleMulaiKuis = useCallback(() => {
    const prepared = prepareQuestions(kuisData.soal, acakOpsi);
    setQuestions(prepared);
    setCurrentIndex(0);
    setSelectedOriginalIndex(null);
    setHasChecked(false);
    setShowHint(false);
    setUsedHint(false);
    setJawabanList([]);
    setHasilAkhir(null);
    setPhase('question');
  }, [kuisData.soal, acakOpsi]);

  // Reset state dan ulangi kuis
  const handleUlangiKuis = useCallback(() => {
    handleMulaiKuis();
  }, [handleMulaiKuis]);

  // Pilih opsi jawaban
  const handleSelectOption = useCallback(
    (originalIndex: number) => {
      if (hasChecked) return;
      setSelectedOriginalIndex(originalIndex);
    },
    [hasChecked]
  );

  // Toggle petunjuk
  const handleToggleHint = useCallback(() => {
    setShowHint((prev) => {
      const next = !prev;
      if (next) {
        setUsedHint(true);
      }
      return next;
    });
  }, []);

  // Periksa jawaban
  const handlePeriksa = useCallback(() => {
    if (selectedOriginalIndex === null || hasChecked || !currentItem) return;

    const isBenar = selectedOriginalIndex === currentItem.soal.jawaban_benar;
    const catatanJawaban: JawabanSiswa = {
      soalId: currentItem.soal.id,
      indeksAsliDipilih: selectedOriginalIndex,
      indeksAsliBenar: currentItem.soal.jawaban_benar,
      isBenar,
      menggunakanPetunjuk: usedHint,
    };

    setJawabanList((prev) => [...prev, catatanJawaban]);
    setHasChecked(true);
  }, [selectedOriginalIndex, hasChecked, currentItem, usedHint]);

  // Lanjut ke soal berikutnya atau tampilkan hasil
  const handleBerikutnya = useCallback(() => {
    if (!hasChecked) return;

    if (currentIndex + 1 < totalSoal) {
      // Ke soal berikutnya
      setCurrentIndex((prev) => prev + 1);
      setSelectedOriginalIndex(null);
      setHasChecked(false);
      setShowHint(false);
      setUsedHint(false);
    } else {
      // Soal terakhir selesai -> hitung hasil akhir
      const updatedJawaban = jawabanList; // Sudah mencakup soal terakhir
      const skor = updatedJawaban.filter((j) => j.isBenar).length;
      const persentase = totalSoal > 0 ? Math.round((skor / totalSoal) * 100) : 0;

      // Hitung rincian per tingkat kesulitan
      const rincian: Record<TingkatKesulitan, RincianKesulitan> = {
        mudah: { benar: 0, total: 0 },
        sedang: { benar: 0, total: 0 },
        sulit: { benar: 0, total: 0 },
      };

      questions.forEach((q) => {
        const t = q.soal.tingkat;
        if (rincian[t]) {
          rincian[t].total += 1;
        }
      });

      updatedJawaban.forEach((j) => {
        const q = questions.find((item) => item.soal.id === j.soalId);
        if (q && j.isBenar) {
          const t = q.soal.tingkat;
          if (rincian[t]) {
            rincian[t].benar += 1;
          }
        }
      });

      // Daftar soal yang salah beserta teks opsi & pembahasan
      const daftarSalah: SoalSalahReview[] = [];
      updatedJawaban.forEach((j) => {
        if (!j.isBenar) {
          const q = questions.find((item) => item.soal.id === j.soalId);
          if (q) {
            const opsiDipilih = q.soal.opsi[j.indeksAsliDipilih] || 'Pilihan tidak dikenal';
            const opsiBenar = q.soal.opsi[j.indeksAsliBenar] || 'Jawaban benar';
            daftarSalah.push({
              soal: q.soal,
              opsiDipilihTeks: opsiDipilih,
              opsiBenarTeks: opsiBenar,
            });
          }
        }
      });

      const hasil: HasilKuis = {
        babNumber,
        judulKuis: kuisData.judul_kuis,
        skor,
        totalSoal,
        persentase,
        rincianKesulitan: rincian,
        soalSalah: daftarSalah,
        waktuSelesai: new Date().toLocaleString('id-ID'),
      };

      // Simpan ke state progres (Kebutuhan 9)
      saveQuizResult(babNumber, skor, totalSoal, persentase);

      // Panggil callback onFinish untuk integrasi tahap 5 bila disediakan
      if (typeof onFinish === 'function') {
        try {
          onFinish(skor, totalSoal, hasil);
        } catch {
          // Abaikan error pada callback eksternal
        }
      }

      setHasilAkhir(hasil);
      setPhase('result');
    }
  }, [
    hasChecked,
    currentIndex,
    totalSoal,
    jawabanList,
    questions,
    babNumber,
    kuisData.judul_kuis,
    onFinish,
  ]);

  // Dukungan Navigasi Keyboard Lengkap (Kebutuhan 7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika fokus sedang berada pada input/textarea/editable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (phase === 'question') {
        const key = e.key.toLowerCase();

        // Pintasan Petunjuk (tombol 'H')
        if (key === 'h' && currentItem?.soal?.petunjuk) {
          e.preventDefault();
          handleToggleHint();
          return;
        }

        // Pintasan Pilihan Opsi 1..4 atau A..D bila belum diperiksa
        if (!hasChecked && currentItem) {
          let chosenOptionIndex = -1;
          if (key === '1' || key === 'a') chosenOptionIndex = 0;
          else if (key === '2' || key === 'b') chosenOptionIndex = 1;
          else if (key === '3' || key === 'c') chosenOptionIndex = 2;
          else if (key === '4' || key === 'd') chosenOptionIndex = 3;

          if (
            chosenOptionIndex >= 0 &&
            chosenOptionIndex < currentItem.opsi.length
          ) {
            e.preventDefault();
            handleSelectOption(currentItem.opsi[chosenOptionIndex].indeksAsli);
            return;
          }

          // Tombol Enter untuk periksa jawaban bila opsi sudah dipilih
          if (key === 'enter' && selectedOriginalIndex !== null) {
            e.preventDefault();
            handlePeriksa();
            return;
          }
        }

        // Tombol Enter atau Spasi untuk lanjut ke soal berikutnya setelah diperiksa
        if (hasChecked && (key === 'enter' || key === ' ')) {
          e.preventDefault();
          handleBerikutnya();
          return;
        }
      } else if (phase === 'result') {
        // Tombol 'R' untuk mengulang kuis dari layar hasil
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          handleUlangiKuis();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    phase,
    hasChecked,
    currentItem,
    selectedOriginalIndex,
    handleToggleHint,
    handleSelectOption,
    handlePeriksa,
    handleBerikutnya,
    handleUlangiKuis,
  ]);

  // Render berdasarkan fase aktif
  if (phase === 'intro') {
    return (
      <KuisIntroView
        kuisData={kuisData}
        babNumber={babNumber}
        acakOpsi={acakOpsi}
        onToggleAcakOpsi={setAcakOpsi}
        onMulai={handleMulaiKuis}
      />
    );
  }

  if (phase === 'question' && currentItem) {
    return (
      <KuisQuestionView
        babNumber={babNumber}
        currentNumber={currentIndex + 1}
        totalSoal={totalSoal}
        item={currentItem}
        selectedOriginalIndex={selectedOriginalIndex}
        hasChecked={hasChecked}
        showHint={showHint}
        usedHint={usedHint}
        onSelectOption={handleSelectOption}
        onToggleHint={handleToggleHint}
        onPeriksa={handlePeriksa}
        onBerikutnya={handleBerikutnya}
      />
    );
  }

  if (phase === 'result' && hasilAkhir) {
    return (
      <KuisResultView
        hasil={hasilAkhir}
        onUlangi={handleUlangiKuis}
      />
    );
  }

  return null;
}
