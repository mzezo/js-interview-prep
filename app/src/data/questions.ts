import type { Question } from '../lib/types';
import { questions as q1 } from './questions-1';
import { questions as q2 } from './questions-2';
import { questions as q3 } from './questions-3';
import { questions as q4 } from './questions-4';

export const allQuestions: Question[] = [...q1, ...q2, ...q3, ...q4];
