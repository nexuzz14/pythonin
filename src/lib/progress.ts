/**
 * Modul Terpusat Pengelolaan State dan LocalStorage Progres Belajar Pythonin.
 * Sesuai PRD Seksi 11 dan Kebutuhan 6-10 Tahap 5.
 *
 * Menangani secara tangguh:
 * - Data kosong (inisialisasi default)
 * - JSON rusak / tidak valid (pencadangan ke backup key + reset aman tanpa crash)
 * - Versi data tidak dikenal
 * - Mode privat / localStorage tidak tersedia (fallback memori aman)
 * - Hydration-safe di Next.js (useSyncExternalStore + isHydrated)
 */

import { useMemo, useSyncExternalStore } from 'react';
import type {
  UserProgress,
  ChapterProgress,
  ChallengeProgress,
  QuizProgress,
  ChapterStatus,
  ChallengeStatus,
  OverallProgressStats,
} from '@/types/progress';

export const PROGRESS_STORAGE_KEY = 'pythonin:v1:progress';
export const BACKUP_STORAGE_KEY = 'pythonin:v1:backup';

const TOTAL_BAB = 5;
const CHALLENGES_PER_BAB = 3;
const TOTAL_CHALLENGES = TOTAL_BAB * CHALLENGES_PER_BAB;
const SECTIONS_PER_BAB = 4;
const TOTAL_READ_SECTIONS = TOTAL_BAB * SECTIONS_PER_BAB;
const TOTAL_QUIZZES = TOTAL_BAB;

export const DEFAULT_EMPTY_PROGRESS: UserProgress = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  chapters: {},
};

// State Memori Cadangan (Fallback jika localStorage diblokir / private browsing)
const inMemoryStore: Record<string, string> = {};
let memoryCachedProgress: UserProgress | null = null;
let memoryCachedSerialized: string = JSON.stringify(DEFAULT_EMPTY_PROGRESS);
let isCorruptedReset = false;

const listeners = new Set<() => void>();

function notifyAllListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Abaikan error pada listener eksternal
    }
  });
}

/**
 * Cek apakah localStorage tersedia dan dapat ditulisi.
 */
function testStorageAvailability(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__pythonin_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Membaca raw string dari storage (localStorage atau fallback memory)
 */
function getRawItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return inMemoryStore[key] ?? null;
  }
}

/**
 * Menulis raw string ke storage (localStorage atau fallback memory)
 */
function setRawItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    inMemoryStore[key] = value;
  }
}

/**
 * Menghapus raw item dari storage
 */
function removeRawItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    delete inMemoryStore[key];
  }
}

/**
 * Migrasi transparan dari key tahap 3/4 ke format progres v1 jika ada
 */
function migrateLegacyStorage(): Record<string, ChapterProgress> {
  const chapters: Record<string, ChapterProgress> = {};
  if (typeof window === 'undefined') return chapters;

  for (let b = 1; b <= TOTAL_BAB; b++) {
    const chapterKey = `bab-${b}`;
    let readSections: string[] = [];
    let quiz: QuizProgress | undefined = undefined;

    // Cek legacy read
    try {
      const readRaw = getRawItem(`pythonin_read_bab_${b}`);
      if (readRaw) {
        const parsed = JSON.parse(readRaw);
        if (Array.isArray(parsed)) {
          readSections = parsed;
        }
      }
    } catch {
      // Abaikan
    }

    // Cek legacy quiz
    try {
      const quizRaw = getRawItem(`pythonin_quiz_bab_${b}`);
      if (quizRaw) {
        const parsed = JSON.parse(quizRaw);
        if (parsed && typeof parsed.skor === 'number') {
          quiz = {
            lastScore: parsed.skor,
            bestScore: parsed.skor,
            total: parsed.total || 5,
            attempts: 1,
            lastAt: parsed.timestamp
              ? new Date(parsed.timestamp).toISOString()
              : new Date().toISOString(),
          };
        }
      }
    } catch {
      // Abaikan
    }

    if (readSections.length > 0 || quiz) {
      chapters[chapterKey] = {
        opened: true,
        readSections,
        challenges: {},
        quiz,
      };
    }
  }

  return chapters;
}

/**
 * Inisialisasi struktur progres default
 */
export function createDefaultProgress(): UserProgress {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    chapters: {},
  };
}

/**
 * Memuat progres dari storage dengan validasi ketat dan pemulihan otomatis.
 */
export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_EMPTY_PROGRESS;
  }

  const raw = getRawItem(PROGRESS_STORAGE_KEY);

  // Kasus 1: Belum ada data di key utama
  if (!raw) {
    // Coba migrasi data dari legacy key
    const migratedChapters = migrateLegacyStorage();
    const initialProgress: UserProgress = {
      version: 1,
      updatedAt: new Date().toISOString(),
      chapters: migratedChapters,
    };
    saveProgress(initialProgress, false);
    return initialProgress;
  }

  // Kasus 2: Ada data, coba parse
  try {
    const parsed = JSON.parse(raw);

    // Kasus 3: Versi tak dikenal atau format bukan objek
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
      console.warn('[Progress] Format versi progres tidak dikenal. Melakukan pencadangan & reset.');
      setRawItem(BACKUP_STORAGE_KEY, raw);
      isCorruptedReset = true;
      const fallback = createDefaultProgress();
      saveProgress(fallback, false);
      return fallback;
    }

    // Pastikan field chapters ada dan bertipe objek
    if (!parsed.chapters || typeof parsed.chapters !== 'object') {
      parsed.chapters = {};
    }

    return parsed as UserProgress;
  } catch (error) {
    // Kasus 4: JSON rusak/corrupt
    console.error('[Progress] JSON progres di localStorage rusak. Mencadangkan ke backup:', error);
    setRawItem(BACKUP_STORAGE_KEY, raw);
    isCorruptedReset = true;
    const cleanProgress = createDefaultProgress();
    saveProgress(cleanProgress, false);
    return cleanProgress;
  }
}

/**
 * Menyimpan progres ke storage dan memperbarui cache memory.
 */
export function saveProgress(progress: UserProgress, notify: boolean = true): void {
  memoryCachedProgress = progress;
  memoryCachedSerialized = JSON.stringify(progress);

  setRawItem(PROGRESS_STORAGE_KEY, memoryCachedSerialized);

  if (notify) {
    notifyAllListeners();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pythonin_progress_updated', {
          detail: progress,
        })
      );
    }
  }
}

/**
 * Mengambil progres aktif (menggunakan cache memori jika sudah ada).
 */
export function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_EMPTY_PROGRESS;
  }
  if (!memoryCachedProgress) {
    memoryCachedProgress = loadProgress();
    memoryCachedSerialized = JSON.stringify(memoryCachedProgress);
  }
  return memoryCachedProgress;
}

/**
 * Helper snapshot untuk useSyncExternalStore
 */
function getProgressSnapshot(): string {
  if (typeof window === 'undefined') {
    return JSON.stringify(DEFAULT_EMPTY_PROGRESS);
  }
  if (!memoryCachedProgress) {
    memoryCachedProgress = loadProgress();
    memoryCachedSerialized = JSON.stringify(memoryCachedProgress);
  }
  return memoryCachedSerialized;
}

function getDefaultProgressSnapshot(): string {
  return JSON.stringify(DEFAULT_EMPTY_PROGRESS);
}

/**
 * Berlangganan perubahan progres (Event listener multi-tab & in-app)
 */
export function subscribeProgress(callback: () => void): () => void {
  listeners.add(callback);

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === PROGRESS_STORAGE_KEY) {
      memoryCachedProgress = null;
      callback();
    }
  };

  const handleCustomEvent = () => {
    callback();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pythonin_progress_updated', handleCustomEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pythonin_progress_updated', handleCustomEvent);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Modifiers (Satu-satunya Titik Tulis Mutasi Progres)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Memperbarui hasil pengerjaan tantangan koding.
 */
export function updateChallengeAttempt(
  babNumber: number,
  challengeId: number,
  passed: boolean,
  hintsUsed: number = 0
): void {
  const current = getProgress();
  const chapterKey = `bab-${babNumber}`;
  const challengeKey = String(challengeId);
  const now = new Date().toISOString();

  const chapter: ChapterProgress = current.chapters[chapterKey] || {
    opened: true,
    readSections: [],
    challenges: {},
  };

  const prevChallenge: ChallengeProgress = chapter.challenges[challengeKey] || {
    passed: false,
    attempts: 0,
    hintsUsed: 0,
  };

  const updatedChallenge: ChallengeProgress = {
    passed: prevChallenge.passed || passed,
    attempts: prevChallenge.attempts + 1,
    hintsUsed: Math.max(prevChallenge.hintsUsed, hintsUsed),
    lastAttemptAt: now,
    passedAt: passed && !prevChallenge.passed ? now : prevChallenge.passedAt,
  };

  const updatedProgress: UserProgress = {
    ...current,
    updatedAt: now,
    chapters: {
      ...current.chapters,
      [chapterKey]: {
        ...chapter,
        opened: true,
        challenges: {
          ...chapter.challenges,
          [challengeKey]: updatedChallenge,
        },
      },
    },
  };

  saveProgress(updatedProgress);
}

/**
 * Memperbarui skor kuis pada bab tertentu.
 */
export function updateQuizResult(
  babNumber: number,
  skor: number,
  total: number
): void {
  const current = getProgress();
  const chapterKey = `bab-${babNumber}`;
  const now = new Date().toISOString();

  const chapter: ChapterProgress = current.chapters[chapterKey] || {
    opened: true,
    readSections: [],
    challenges: {},
  };

  const prevQuiz = chapter.quiz;
  const newAttempts = (prevQuiz?.attempts || 0) + 1;
  const newBestScore = prevQuiz ? Math.max(prevQuiz.bestScore, skor) : skor;

  const updatedQuiz: QuizProgress = {
    lastScore: skor,
    bestScore: newBestScore,
    total: total > 0 ? total : 5,
    attempts: newAttempts,
    lastAt: now,
  };

  const updatedProgress: UserProgress = {
    ...current,
    updatedAt: now,
    chapters: {
      ...current.chapters,
      [chapterKey]: {
        ...chapter,
        opened: true,
        quiz: updatedQuiz,
      },
    },
  };

  saveProgress(updatedProgress);

  // Sync balik ke legacy key untuk kompatibilitas skrip luar
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        `pythonin_quiz_bab_${babNumber}`,
        JSON.stringify({
          babNumber,
          skor,
          total,
          persentase: Math.round((skor / total) * 100),
          timestamp: Date.now(),
        })
      );
    } catch {
      // Abaikan
    }
  }
}

/**
 * Menandai / toggle bacaan bagian materi.
 */
export function toggleReadSection(babNumber: number, sectionId: string): void {
  const current = getProgress();
  const chapterKey = `bab-${babNumber}`;
  const now = new Date().toISOString();

  const chapter: ChapterProgress = current.chapters[chapterKey] || {
    opened: true,
    readSections: [],
    challenges: {},
  };

  const currentSections = new Set(chapter.readSections || []);
  if (currentSections.has(sectionId)) {
    currentSections.delete(sectionId);
  } else {
    currentSections.add(sectionId);
  }

  const updatedList = Array.from(currentSections);

  const updatedProgress: UserProgress = {
    ...current,
    updatedAt: now,
    chapters: {
      ...current.chapters,
      [chapterKey]: {
        ...chapter,
        opened: true,
        readSections: updatedList,
      },
    },
  };

  saveProgress(updatedProgress);

  // Sync balik ke legacy key
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        `pythonin_read_bab_${babNumber}`,
        JSON.stringify(updatedList)
      );
    } catch {
      // Abaikan
    }
  }
}

/**
 * Menandai bab telah dibuka.
 */
export function markChapterOpened(babNumber: number): void {
  const current = getProgress();
  const chapterKey = `bab-${babNumber}`;
  const now = new Date().toISOString();

  const chapter: ChapterProgress = current.chapters[chapterKey] || {
    opened: false,
    readSections: [],
    challenges: {},
  };

  if (chapter.opened) return; // sudah dibuka sebelumnya

  const updatedProgress: UserProgress = {
    ...current,
    updatedAt: now,
    chapters: {
      ...current.chapters,
      [chapterKey]: {
        ...chapter,
        opened: true,
      },
    },
  };

  saveProgress(updatedProgress);
}

/**
 * Menghapus seluruh data progres belajar (Reset Progress).
 */
export function resetProgress(): void {
  removeRawItem(PROGRESS_STORAGE_KEY);
  removeRawItem(BACKUP_STORAGE_KEY);

  // Bersihkan juga legacy keys
  for (let b = 1; b <= TOTAL_BAB; b++) {
    removeRawItem(`pythonin_read_bab_${b}`);
    removeRawItem(`pythonin_quiz_bab_${b}`);
  }

  isCorruptedReset = false;
  const fresh = createDefaultProgress();
  saveProgress(fresh);
}

// ─────────────────────────────────────────────────────────────────────────────
// Kalkulator & Evaluator Status Progres
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Menghitung status tantangan (belum, dicoba, selesai).
 */
export function getChallengeStatus(
  babNumber: number,
  challengeId: number,
  progress: UserProgress = getProgress()
): ChallengeStatus {
  const ch = progress.chapters[`bab-${babNumber}`];
  if (!ch) return 'belum';

  const chal = ch.challenges[String(challengeId)];
  if (!chal || chal.attempts === 0) return 'belum';
  if (chal.passed) return 'selesai';
  return 'dicoba';
}

/**
 * Menghitung status keseluruhan suatu bab (belum, sedang, selesai).
 * Sesuai PRD Seksi 11.1: Selesai jika semua 3 tantangan bab lulus DAN kuis telah dikerjakan (attempts >= 1).
 */
export function getChapterStatus(
  babNumber: number,
  progress: UserProgress = getProgress()
): ChapterStatus {
  const ch = progress.chapters[`bab-${babNumber}`];
  if (!ch) return 'belum';

  const challenges = ch.challenges || {};
  let passedCount = 0;
  for (let c = 1; c <= CHALLENGES_PER_BAB; c++) {
    if (challenges[String(c)]?.passed) {
      passedCount++;
    }
  }

  const quizAttempts = ch.quiz?.attempts || 0;
  const readCount = ch.readSections?.length || 0;

  // Lolos jika 3 tantangan selesai DAN kuis pernah dikerjakan
  if (passedCount >= CHALLENGES_PER_BAB && quizAttempts >= 1) {
    return 'selesai';
  }

  // Sedang berjalan jika ada materi dibaca, tantangan dicoba, atau kuis dicoba
  const hasActivity =
    ch.opened ||
    readCount > 0 ||
    Object.keys(challenges).length > 0 ||
    quizAttempts > 0;

  return hasActivity ? 'sedang' : 'belum';
}

/**
 * Menghitung statistik keseluruhan pembelajaran Pythonin.
 */
export function getOverallStats(progress: UserProgress = getProgress()): OverallProgressStats {
  let completedChapters = 0;
  let passedChallenges = 0;
  let attemptedQuizzes = 0;
  let readSectionsCount = 0;

  for (let b = 1; b <= TOTAL_BAB; b++) {
    const status = getChapterStatus(b, progress);
    if (status === 'selesai') {
      completedChapters++;
    }

    const ch = progress.chapters[`bab-${b}`];
    if (ch) {
      readSectionsCount += (ch.readSections?.length || 0);

      const challenges = ch.challenges || {};
      for (let c = 1; c <= CHALLENGES_PER_BAB; c++) {
        if (challenges[String(c)]?.passed) {
          passedChallenges++;
        }
      }

      if (ch.quiz && ch.quiz.attempts > 0) {
        attemptedQuizzes++;
      }
    }
  }

  // Bobot penyelesaian: Total 40 komponen (20 bagian materi + 15 tantangan + 5 kuis)
  const totalTasks = TOTAL_READ_SECTIONS + TOTAL_CHALLENGES + TOTAL_QUIZZES;
  const completedTasks = readSectionsCount + passedChallenges + attemptedQuizzes;
  const overallPercentage =
    totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

  const hasActivity =
    completedTasks > 0 || Object.keys(progress.chapters).length > 0;

  return {
    totalChapters: TOTAL_BAB,
    completedChapters,
    totalChallenges: TOTAL_CHALLENGES,
    passedChallenges,
    totalQuizzes: TOTAL_QUIZZES,
    attemptedQuizzes,
    totalReadSections: TOTAL_READ_SECTIONS,
    readSectionsCount,
    overallPercentage,
    lastActivityAt: hasActivity && progress.updatedAt ? progress.updatedAt : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook Terpusat: useProgress() (Hydration-Safe React 19)
// ─────────────────────────────────────────────────────────────────────────────

export interface UseProgressReturn {
  progress: UserProgress;
  isHydrated: boolean;
  isStorageAvailable: boolean;
  hasCorruptedDataReset: boolean;
  stats: OverallProgressStats;
  updateChallengeAttempt: typeof updateChallengeAttempt;
  updateQuizResult: typeof updateQuizResult;
  toggleReadSection: typeof toggleReadSection;
  markChapterOpened: typeof markChapterOpened;
  resetProgress: typeof resetProgress;
  getChapterStatus: (babNum: number) => ChapterStatus;
  getChallengeStatus: (babNum: number, chalId: number) => ChallengeStatus;
}

const emptySubscribe = () => () => {};

export function useProgress(): UseProgressReturn {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const serialized = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getDefaultProgressSnapshot
  );

  const parsedProgress = useMemo<UserProgress>(() => {
    if (!isHydrated) return DEFAULT_EMPTY_PROGRESS;
    try {
      return JSON.parse(serialized);
    } catch {
      return DEFAULT_EMPTY_PROGRESS;
    }
  }, [isHydrated, serialized]);

  const stats = useMemo(() => {
    return getOverallStats(parsedProgress);
  }, [parsedProgress]);

  return {
    progress: parsedProgress,
    isHydrated,
    isStorageAvailable: testStorageAvailability(),
    hasCorruptedDataReset: isCorruptedReset,
    stats,
    updateChallengeAttempt,
    updateQuizResult,
    toggleReadSection,
    markChapterOpened,
    resetProgress,
    getChapterStatus: (babNum: number) => getChapterStatus(babNum, parsedProgress),
    getChallengeStatus: (babNum: number, chalId: number) =>
      getChallengeStatus(babNum, chalId, parsedProgress),
  };
}
