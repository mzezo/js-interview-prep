'use client';

import { Modal } from './QuizMode';
import { Icon } from './Icon';
import { categories } from '@/data/categories';
import type { Status } from '@/lib/types';

interface StatsModalProps {
  onClose: () => void;
  onReset: () => void;
  counts: {
    all: number;
    notStarted: number;
    studied: number;
    needsReview: number;
    mastered: number;
    bookmarked: number;
    byCategory: Record<string, { total: number; completed: number; mastered: number }>;
  };
}

export function StatsModal({ onClose, onReset, counts }: StatsModalProps) {
  const completed = counts.studied + counts.needsReview + counts.mastered;
  const overallPct = counts.all === 0 ? 0 : Math.round((completed / counts.all) * 100);
  const masteryPct = counts.all === 0 ? 0 : Math.round((counts.mastered / counts.all) * 100);

  const handleReset = () => {
    if (confirm('Reset all progress? This will clear statuses and bookmarks. This cannot be undone.')) {
      onReset();
      onClose();
    }
  };

  return (
    <Modal onClose={onClose} ariaLabel="Statistics">
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Your progress
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon.X />
        </button>
      </div>

      <div className="overflow-y-auto thin-scroll px-6 py-6 flex-1 space-y-6">
        {/* Overall progress */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Overall completion
            </h3>
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
              {overallPct}%
            </span>
          </div>
          <ProgressBar value={completed} total={counts.all} color="var(--accent)" />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {completed} of {counts.all} questions touched
          </p>
        </section>

        {/* Mastery */}
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Mastered
            </h3>
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--status-mastered)' }}>
              {masteryPct}%
            </span>
          </div>
          <ProgressBar value={counts.mastered} total={counts.all} color="var(--status-mastered)" />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {counts.mastered} of {counts.all} mastered
          </p>
        </section>

        {/* Status breakdown */}
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            By status
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Icon.Circle />}
              label="Not started"
              value={counts.notStarted}
              color="var(--status-not-started)"
              bg="var(--status-not-started-bg)"
            />
            <StatCard
              icon={<Icon.CheckCircle />}
              label="Studied"
              value={counts.studied}
              color="var(--status-studied)"
              bg="var(--status-studied-bg)"
            />
            <StatCard
              icon={<Icon.Clock />}
              label="Needs review"
              value={counts.needsReview}
              color="var(--status-needs-review)"
              bg="var(--status-needs-review-bg)"
            />
            <StatCard
              icon={<Icon.Star />}
              label="Mastered"
              value={counts.mastered}
              color="var(--status-mastered)"
              bg="var(--status-mastered-bg)"
            />
          </div>
        </section>

        {/* Category breakdown */}
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
            By category
          </h3>
          <div className="space-y-2">
            {categories.map((c) => {
              const stats = counts.byCategory[c.id] ?? { total: 0, completed: 0, mastered: 0 };
              const pct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
              return (
                <div key={c.id}>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text)' }}>{c.label}</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {stats.completed}/{stats.total} · {pct}%
                    </span>
                  </div>
                  <ProgressBar value={stats.completed} total={stats.total} color="var(--accent)" small />
                </div>
              );
            })}
          </div>
        </section>

        {/* Bookmarks count */}
        {counts.bookmarked > 0 && (
          <section
            className="rounded-lg p-4 border"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Icon.BookmarkFilled style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>
                <strong>{counts.bookmarked}</strong> bookmarked
              </span>
            </div>
          </section>
        )}
      </div>

      <div
        className="px-6 py-4 border-t shrink-0 flex justify-end"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <Icon.RotateCcw width={14} height={14} />
          Reset all progress
        </button>
      </div>
    </Modal>
  );
}

function ProgressBar({
  value,
  total,
  color,
  small,
}: {
  value: number;
  total: number;
  color: string;
  small?: boolean;
}) {
  const pct = total === 0 ? 0 : (value / total) * 100;
  return (
    <div
      className={`rounded-full overflow-hidden ${small ? 'h-1.5' : 'h-2.5'}`}
      style={{ background: 'var(--bg-subtle)' }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{ background: bg, color }}
        >
          {icon}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
        {value}
      </div>
    </div>
  );
}
