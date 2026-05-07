import { describe, it, expect } from 'vitest';
import { getAllChapters } from './content';

describe('getAllChapters', () => {
  it('returns chapters sorted by order', () => {
    const chapters = getAllChapters();
    expect(chapters.length).toBeGreaterThan(0);
    for (let i = 1; i < chapters.length; i++) {
      expect(chapters[i].order).toBeGreaterThanOrEqual(chapters[i - 1].order);
    }
  });

  it('extracts title and slug from frontmatter and filename', () => {
    const chapters = getAllChapters();
    chapters.forEach((c) => {
      expect(c.title).toBeTruthy();
      expect(c.slug).toBeTruthy();
      expect(c.content).toBeTruthy();
    });
  });
});
