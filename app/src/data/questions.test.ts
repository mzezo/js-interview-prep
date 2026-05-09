import { describe, it, expect } from 'vitest';
import { allQuestions } from './questions';
import { categories } from './categories';

describe('questions data', () => {
  it('has 164 questions', () => {
    expect(allQuestions.length).toBe(164);
  });

  it('has unique ids', () => {
    const ids = allQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question references a valid category', () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const q of allQuestions) {
      expect(categoryIds.has(q.category)).toBe(true);
    }
  });

  it('every question has a non-empty title and answer', () => {
    for (const q of allQuestions) {
      expect(q.title.length).toBeGreaterThan(0);
      expect(q.answer.length).toBeGreaterThan(0);
    }
  });

  it('ids are sequential from 1 to 164', () => {
    const sorted = [...allQuestions].sort((a, b) => a.id - b.id);
    sorted.forEach((q, i) => {
      expect(q.id).toBe(i + 1);
    });
  });
});
