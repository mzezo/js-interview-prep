'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Icon } from './Icon';
import { categories } from '@/data/categories';
import type { Question, Status } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  expanded: boolean;
  status: Status;
  bookmarked: boolean;
  onToggleExpand: () => void;
  onStatusChange: (s: Status) => void;
  onToggleBookmark: () => void;
}

const statusLabels: Record<Status, string> = {
  'not-started': 'Not Started',
  studied: 'Studied',
  'needs-review': 'Needs Review',
  mastered: 'Mastered',
};

const statusColors: Record<Status, { bg: string; text: string; icon: React.ReactNode }> = {
  'not-started': {
    bg: 'var(--status-not-started-bg)',
    text: 'var(--status-not-started)',
    icon: <Icon.Circle width={14} height={14} />,
  },
  studied: {
    bg: 'var(--status-studied-bg)',
    text: 'var(--status-studied)',
    icon: <Icon.CheckCircle width={14} height={14} />,
  },
  'needs-review': {
    bg: 'var(--status-needs-review-bg)',
    text: 'var(--status-needs-review)',
    icon: <Icon.Clock width={14} height={14} />,
  },
  mastered: {
    bg: 'var(--status-mastered-bg)',
    text: 'var(--status-mastered)',
    icon: <Icon.Star width={14} height={14} />,
  },
};

export function QuestionCard({
  question,
  expanded,
  status,
  bookmarked,
  onToggleExpand,
  onStatusChange,
  onToggleBookmark,
}: QuestionCardProps) {
  const category = categories.find((c) => c.id === question.category);
  const statusStyle = statusColors[status];

  return (
    <article
      className="rounded-lg border transition-shadow"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: expanded ? 'var(--accent)' : 'var(--border)',
        boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      {/* Header — clickable */}
      <button
        onClick={onToggleExpand}
        className="w-full text-left p-4 md:p-5"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-1 transition-transform"
            style={{
              color: 'var(--text-subtle)',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <Icon.ChevronRight />
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-mono" style={{ color: 'var(--text-subtle)' }}>
                #{question.id}
              </span>
              <h3 className="text-base md:text-[15px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>
                {question.title}
              </h3>
            </div>

            {/* Tags row */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {category && (
                <span
                  className="px-2.5 py-0.5 text-xs rounded-md"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                >
                  {category.label}
                </span>
              )}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-md"
                style={{ background: statusStyle.bg, color: statusStyle.text }}
              >
                {statusStyle.icon}
                {statusLabels[status]}
              </span>
            </div>
          </div>

          {/* Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className="p-1.5 rounded-md transition-colors shrink-0"
            style={{ color: bookmarked ? 'var(--accent)' : 'var(--text-subtle)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            aria-pressed={bookmarked}
          >
            {bookmarked ? <Icon.BookmarkFilled /> : <Icon.Bookmark />}
          </button>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 md:px-5 pb-5 animate-slide-down">
          <div
            className="ml-7 pt-2 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="answer-content pt-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
              >
                {question.answer}
              </ReactMarkdown>
            </div>

            {/* Status controls */}
            <StatusControls current={status} onChange={onStatusChange} />
          </div>
        </div>
      )}
    </article>
  );
}

function StatusControls({
  current,
  onChange,
}: {
  current: Status;
  onChange: (s: Status) => void;
}) {
  const options: Status[] = ['not-started', 'studied', 'needs-review', 'mastered'];

  return (
    <div
      className="mt-6 pt-4 border-t flex items-center gap-2 flex-wrap"
      style={{ borderColor: 'var(--border)' }}
    >
      <span className="text-xs font-medium mr-2" style={{ color: 'var(--text-muted)' }}>
        Mark as:
      </span>
      {options.map((opt) => {
        const isActive = current === opt;
        const style = statusColors[opt];
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
            style={{
              background: isActive ? style.bg : 'transparent',
              color: isActive ? style.text : 'var(--text-muted)',
              borderColor: isActive ? style.text : 'var(--border)',
            }}
            aria-pressed={isActive}
          >
            {style.icon}
            {statusLabels[opt]}
          </button>
        );
      })}
    </div>
  );
}
