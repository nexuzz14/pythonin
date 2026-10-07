/**
 * Modul Penyimpanan dan Pengelolaan State Hasil Kuis.
 * Dirancang agar mudah disambungkan dengan sistem progres di Tahap 5.
 */

export interface SavedQuizResult {
  babNumber: number;
  skor: number;
  total: number;
  persentase: number;
  timestamp: number;
  selesaiPada: string;
}

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Abaikan error pada listener
    }
  });
}

import { updateQuizResult } from './progress';

/**
 * Menyimpan hasil pengerjaan kuis bab ke localStorage.
 * Menghasilkan event notifikasi agar komponen lain dapat merespons secara reaktif.
 */
export function saveQuizResult(
  babNumber: number,
  skor: number,
  total: number,
  persentase?: number
): SavedQuizResult {
  try {
    updateQuizResult(babNumber, skor, total);
  } catch {
    // Abaikan jika ada error
  }
  const calculatedPercentage =
    typeof persentase === 'number'
      ? persentase
      : total > 0
      ? Math.round((skor / total) * 100)
      : 0;

  const now = new Date();
  const result: SavedQuizResult = {
    babNumber,
    skor,
    total,
    persentase: calculatedPercentage,
    timestamp: now.getTime(),
    selesaiPada: now.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `pythonin_quiz_bab_${babNumber}`,
        JSON.stringify(result)
      );

      // Notifikasi Custom Event untuk integrasi Tahap 5
      window.dispatchEvent(
        new CustomEvent('pythonin_quiz_completed', {
          detail: result,
        })
      );
    } catch {
      // Abaikan bila localStorage tidak dapat diakses (misal mode private penuh)
    }
  }

  notifyListeners();
  return result;
}

/**
 * Mengambil hasil kuis yang tersimpan untuk bab tertentu.
 */
export function getQuizResult(babNumber: number): SavedQuizResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`pythonin_quiz_bab_${babNumber}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.skor === 'number' &&
      typeof parsed.total === 'number'
    ) {
      return parsed as SavedQuizResult;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Mengambil rekap seluruh hasil kuis bab (1 s.d. 5).
 */
export function getAllQuizResults(): Record<number, SavedQuizResult> {
  const results: Record<number, SavedQuizResult> = {};
  for (let i = 1; i <= 5; i++) {
    const res = getQuizResult(i);
    if (res) {
      results[i] = res;
    }
  }
  return results;
}

/**
 * Menghapus data hasil kuis bab tertentu (misal saat reset progres).
 */
export function clearQuizResult(babNumber: number): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`pythonin_quiz_bab_${babNumber}`);
    notifyListeners();
  } catch {
    // Abaikan
  }
}

/**
 * Berlangganan perubahan data progres kuis (kompatibel dengan useSyncExternalStore atau event listener).
 */
export function subscribeToQuizProgress(callback: () => void): () => void {
  listeners.add(callback);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback);
    }
  };
}
