'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Status } from '@/lib/types';

const STORAGE_KEY = 'js-interview-prep:progress:v1';

export interface Progress {
  /** Map of questionId → status */
  status: Record<number, Status>;
  /** Set of bookmarked question IDs */
  bookmarks: number[];
}

const empty: Progress = { status: {}, bookmarks: [] };

function read(): Progress {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      status: parsed.status ?? {},
      bookmarks: parsed.bookmarks ?? [],
    };
  } catch {
    return empty;
  }
}

function write(progress: Progress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota exceeded or storage disabled — fail silently
  }
}

/**
 * Hook that exposes progress (status + bookmarks) and persists changes.
 * Survives refresh via localStorage. SSR-safe (returns empty on server).
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(empty);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setProgress(read());
    setHydrated(true);
  }, []);

  // Persist on change (after hydration to avoid clobbering)
  useEffect(() => {
    if (hydrated) write(progress);
  }, [progress, hydrated]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProgress(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setStatus = useCallback((id: number, status: Status) => {
    setProgress((prev) => ({
      ...prev,
      status: { ...prev.status, [id]: status },
    }));
  }, []);

  const toggleBookmark = useCallback((id: number) => {
    setProgress((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(id)
        ? prev.bookmarks.filter((b) => b !== id)
        : [...prev.bookmarks, id],
    }));
  }, []);

  const reset = useCallback(() => {
    setProgress(empty);
  }, []);

  const getStatus = useCallback(
    (id: number): Status => progress.status[id] ?? 'not-started',
    [progress.status],
  );

  const isBookmarked = useCallback(
    (id: number): boolean => progress.bookmarks.includes(id),
    [progress.bookmarks],
  );

  return {
    progress,
    hydrated,
    setStatus,
    toggleBookmark,
    reset,
    getStatus,
    isBookmarked,
  };
}
