/**
 * Tipe Data dan Struktur Progres Belajar Pythonin.
 * Sesuai spesifikasi PRD Seksi 11 (Single Source of Truth untuk LocalStorage).
 */

export interface ChallengeProgress {
  passed: boolean;
  attempts: number;
  hintsUsed: number;
  passedAt?: string;
  lastAttemptAt?: string;
}

export interface QuizProgress {
  lastScore: number;
  bestScore: number;
  total: number;
  attempts: number;
  lastAt: string;
}

export interface ChapterProgress {
  opened?: boolean;
  readSections?: string[];
  challenges: Record<string, ChallengeProgress>; // key: id tantangan (mis. "1", "2", "3")
  quiz?: QuizProgress;
}

export interface UserProgress {
  version: 1;
  updatedAt: string; // ISO 8601 string
  chapters: Record<string, ChapterProgress>; // key: "bab-1" s.d. "bab-5"
}

export type ChapterStatus = 'belum' | 'sedang' | 'selesai';
export type ChallengeStatus = 'belum' | 'dicoba' | 'selesai';

export interface OverallProgressStats {
  totalChapters: number;
  completedChapters: number;
  totalChallenges: number;
  passedChallenges: number;
  totalQuizzes: number;
  attemptedQuizzes: number;
  totalReadSections: number;
  readSectionsCount: number;
  overallPercentage: number;
  lastActivityAt: string | null;
}
