import { useSyncExternalStore, useMemo, useCallback } from 'react';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Abaikan error pada listener
    }
  });
}

function subscribeToProgress(callback: () => void): () => void {
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

export function getReadSections(babNumber: number): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`pythonin_read_bab_${babNumber}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

import { toggleReadSection as toggleCentralReadSection } from './progress';

export function toggleReadSection(babNumber: number, sectionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    toggleCentralReadSection(babNumber, sectionId);
  } catch {
    // Abaikan jika ada error
  }
  try {
    const current = getReadSections(babNumber);
    const set = new Set(current);
    if (set.has(sectionId)) {
      set.delete(sectionId);
    } else {
      set.add(sectionId);
    }
    localStorage.setItem(
      `pythonin_read_bab_${babNumber}`,
      JSON.stringify(Array.from(set))
    );
    notify();
  } catch {
    // Abaikan
  }
}

/**
 * Custom Hook untuk memantau status penanda bagian yang sudah dibaca (React 19 / Next.js SSR friendly).
 */
export function useReadSections(babNumber: number): {
  readSections: Set<string>;
  toggleRead: (sectionId: string) => void;
  count: number;
} {
  const serialized = useSyncExternalStore(
    subscribeToProgress,
    () => JSON.stringify(getReadSections(babNumber)),
    () => '[]'
  );

  const parsed = useMemo(() => {
    try {
      const arr = JSON.parse(serialized);
      return new Set<string>(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set<string>();
    }
  }, [serialized]);

  const toggle = useCallback(
    (sectionId: string) => {
      toggleReadSection(babNumber, sectionId);
    },
    [babNumber]
  );

  return {
    readSections: parsed,
    toggleRead: toggle,
    count: parsed.size,
  };
}
