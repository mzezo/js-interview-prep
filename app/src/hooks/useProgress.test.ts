import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from './useProgress';

describe('useProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with not-started for unknown question', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.getStatus(1)).toBe('not-started');
    expect(result.current.isBookmarked(1)).toBe(false);
  });

  it('updates status and persists to localStorage', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.setStatus(1, 'mastered'));
    expect(result.current.getStatus(1)).toBe('mastered');

    const stored = JSON.parse(window.localStorage.getItem('js-interview-prep:progress:v1')!);
    expect(stored.status[1]).toBe('mastered');
  });

  it('toggles bookmarks', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.toggleBookmark(5));
    expect(result.current.isBookmarked(5)).toBe(true);
    act(() => result.current.toggleBookmark(5));
    expect(result.current.isBookmarked(5)).toBe(false);
  });

  it('reset clears everything', () => {
    const { result } = renderHook(() => useProgress());
    act(() => {
      result.current.setStatus(1, 'studied');
      result.current.toggleBookmark(2);
    });
    act(() => result.current.reset());
    expect(result.current.getStatus(1)).toBe('not-started');
    expect(result.current.isBookmarked(2)).toBe(false);
  });
});
