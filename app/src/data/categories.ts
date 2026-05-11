import type { Category } from '../lib/types';

export const categories: Category[] = [
  { id: 'fundamentals', label: 'JS Fundamentals', description: 'Scope, closures, this' },
  { id: 'event-loop', label: 'Event Loop & Async', description: 'Microtasks, promises' },
  { id: 'prototypes', label: 'Prototypes & Classes', description: 'Inheritance, OOP' },
  { id: 'arrays-objects', label: 'Arrays & Immutability', description: 'Mutation, cloning' },
  { id: 'data-structures', label: 'Data Structures', description: 'Stacks, queues, trees' },
  { id: 'algorithms', label: 'Algorithm Patterns', description: 'Two pointers, sliding window' },
  { id: 'react-core', label: 'React Core', description: 'Rendering, reconciliation' },
  { id: 'react-hooks', label: 'React Hooks', description: 'useState, useEffect, custom' },
  { id: 'state-management', label: 'State Management', description: 'Context, Redux, server state' },
  { id: 'performance', label: 'Performance', description: 'Profiling, memoization' },
  { id: 'testing', label: 'Testing', description: 'Unit, integration, E2E' },
  { id: 'debugging', label: 'Debugging', description: 'Memory leaks, race conditions' },
  { id: 'networking', label: 'Networking & HTTP', description: 'CORS, caching, auth' },
  { id: 'system-design', label: 'System Design', description: 'Frontend architecture' },
  { id: 'behavioral', label: 'Behavioral', description: 'Communication, stories' },
  { id: 'typescript', label: 'TypeScript', description: 'Types, generics, advanced patterns' },
];
