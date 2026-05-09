export type Status = 'not-started' | 'studied' | 'needs-review' | 'mastered';

export type Difficulty = 'junior' | 'mid' | 'senior';

export interface Question {
  id: number;
  category: string;
  title: string;
  difficulty: Difficulty;
  /** Markdown content rendered when the card is expanded */
  answer: string;
  /** Short tagline shown after the title (optional) */
  hint?: string;
}

export interface Category {
  id: string;
  label: string;
  description?: string;
}
