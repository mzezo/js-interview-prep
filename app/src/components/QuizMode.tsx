'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Icon } from './Icon';
import { categories } from '@/data/categories';
import type { Question, Status } from '@/lib/types';

interface QuizModeProps {
  questions: Question[];
  onClose: () => void;
  getStatus: (id: number) => Status;
  setStatus: (id: number, s: Status) => void;
}

export function QuizMode({ questions, onClose, getStatus, setStatus }: QuizModeProps) {
  // Shuffle once when entering quiz mode
  const shuffled = useMemo(
    () => [...questions].sort(() => Math.random() - 0.5),
    [questions],
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const current = shuffled[index];

  useEffect(() => {
    setRevealed(false);
  }, [index]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setRevealed((r) => !r);
      }
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, shuffled.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shuffled.length, onClose]);

  const next = () => setIndex((i) => Math.min(i + 1, shuffled.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  if (!current) {
    return (
      <Modal onClose={onClose}>
        <div className="p-8 text-center">
          <p style={{ color: 'var(--text-muted)' }}>No questions match the current filter.</p>
        </div>
      </Modal>
    );
  }

  const category = categories.find((c) => c.id === current.category);
  const status = getStatus(current.id);

  const handleStatusAndNext = (s: Status) => {
    setStatus(current.id, s);
    if (index < shuffled.length - 1) next();
  };

  return (
    <Modal onClose={onClose} ariaLabel={`Quiz: question ${index + 1} of ${shuffled.length}`}>
      {/* Quiz header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Quiz mode
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Question {index + 1} of {shuffled.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close quiz"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon.X />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto thin-scroll px-6 py-6 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-sm font-mono" style={{ color: 'var(--text-subtle)' }}>
            #{current.id}
          </span>
          {category && (
            <span
              className="px-2.5 py-0.5 text-xs rounded-md"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >
              {category.label}
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>
          {current.title}
        </h3>

        {!revealed ? (
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Try to answer in your head, then reveal.
            </p>
            <button
              onClick={() => setRevealed(true)}
              className="px-5 py-2.5 text-sm font-medium rounded-lg text-white"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Reveal answer (Space)
            </button>
          </div>
        ) : (
          <div className="answer-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
            >
              {current.answer}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer — navigation + status */}
      <div
        className="px-6 py-4 border-t flex items-center gap-3 flex-wrap shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={prev}
          disabled={index === 0}
          className="px-4 py-2 text-sm font-medium rounded-md border disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          ← Previous
        </button>

        {revealed && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              How did you do?
            </span>
            <button
              onClick={() => handleStatusAndNext('needs-review')}
              className="px-3 py-1.5 text-xs font-medium rounded-md border"
              style={{
                background: 'var(--status-needs-review-bg)',
                color: 'var(--status-needs-review)',
                borderColor: 'var(--status-needs-review)',
              }}
            >
              Needs review
            </button>
            <button
              onClick={() => handleStatusAndNext('studied')}
              className="px-3 py-1.5 text-xs font-medium rounded-md border"
              style={{
                background: 'var(--status-studied-bg)',
                color: 'var(--status-studied)',
                borderColor: 'var(--status-studied)',
              }}
            >
              Got it
            </button>
            <button
              onClick={() => handleStatusAndNext('mastered')}
              className="px-3 py-1.5 text-xs font-medium rounded-md border"
              style={{
                background: 'var(--status-mastered-bg)',
                color: 'var(--status-mastered)',
                borderColor: 'var(--status-mastered)',
              }}
            >
              Mastered
            </button>
          </div>
        )}

        <button
          onClick={next}
          disabled={index === shuffled.length - 1}
          className="ml-auto px-4 py-2 text-sm font-medium rounded-md border disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Next →
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────

export function Modal({
  children,
  onClose,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel?: string;
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className="rounded-xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[90vh]"
        style={{ background: 'var(--bg-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
