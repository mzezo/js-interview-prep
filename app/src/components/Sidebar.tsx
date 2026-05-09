'use client';

import { Icon } from './Icon';
import { categories } from '@/data/categories';
import type { Status } from '@/lib/types';

export type StatusFilter = 'all' | Status | 'bookmarked';

interface SidebarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (s: StatusFilter) => void;
  categoryFilter: string | 'all';
  onCategoryFilterChange: (c: string | 'all') => void;
  counts: {
    all: number;
    notStarted: number;
    studied: number;
    needsReview: number;
    mastered: number;
    bookmarked: number;
    byCategory: Record<string, { total: number; completed: number }>;
  };
}

export function Sidebar({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  counts,
}: SidebarProps) {
  return (
    <aside
      className="md:sticky md:top-16 md:self-start md:h-[calc(100vh-4rem)] md:overflow-y-auto thin-scroll w-full md:w-72 shrink-0 border-r p-4 space-y-6"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
      aria-label="Filters and navigation"
    >
      {/* ── Status filter ─────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Filter by Status
        </h2>
        <ul className="space-y-0.5">
          <FilterItem
            active={statusFilter === 'all'}
            onClick={() => onStatusFilterChange('all')}
            icon={<Icon.Filter />}
            label="All Questions"
            count={counts.all}
            color="accent"
          />
          <FilterItem
            active={statusFilter === 'not-started'}
            onClick={() => onStatusFilterChange('not-started')}
            icon={<Icon.Circle />}
            label="Not Started"
            count={counts.notStarted}
            color="muted"
          />
          <FilterItem
            active={statusFilter === 'studied'}
            onClick={() => onStatusFilterChange('studied')}
            icon={<Icon.CheckCircle />}
            label="Studied"
            count={counts.studied}
            color="studied"
          />
          <FilterItem
            active={statusFilter === 'needs-review'}
            onClick={() => onStatusFilterChange('needs-review')}
            icon={<Icon.Clock />}
            label="Needs Review"
            count={counts.needsReview}
            color="needs-review"
          />
          <FilterItem
            active={statusFilter === 'mastered'}
            onClick={() => onStatusFilterChange('mastered')}
            icon={<Icon.Star />}
            label="Mastered"
            count={counts.mastered}
            color="mastered"
          />
        </ul>
      </section>

      {/* ── Bookmarked ──────────────────────────── */}
      <section>
        <ul>
          <FilterItem
            active={statusFilter === 'bookmarked'}
            onClick={() => onStatusFilterChange('bookmarked')}
            icon={<Icon.Bookmark />}
            label="Bookmarked"
            count={counts.bookmarked}
            color="muted"
          />
        </ul>
      </section>

      {/* ── Categories ─────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Categories
        </h2>
        <ul className="space-y-0.5">
          <CategoryItem
            active={categoryFilter === 'all'}
            onClick={() => onCategoryFilterChange('all')}
            label="All Categories"
            count={`${counts.all}`}
          />
          {categories.map((c) => {
            const stats = counts.byCategory[c.id] ?? { total: 0, completed: 0 };
            return (
              <CategoryItem
                key={c.id}
                active={categoryFilter === c.id}
                onClick={() => onCategoryFilterChange(c.id)}
                label={c.label}
                count={`${stats.completed}/${stats.total}`}
              />
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────

function FilterItem({
  active,
  onClick,
  icon,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  color: 'accent' | 'muted' | 'studied' | 'needs-review' | 'mastered';
}) {
  const colorMap: Record<typeof color, string> = {
    accent: 'var(--accent)',
    muted: 'var(--text-muted)',
    studied: 'var(--status-studied)',
    'needs-review': 'var(--status-needs-review)',
    mastered: 'var(--status-mastered)',
  };

  return (
    <li>
      <button
        onClick={onClick}
        aria-current={active ? 'true' : undefined}
        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors group"
        style={{
          background: active ? 'var(--accent-soft)' : 'transparent',
          color: active ? 'var(--accent-text)' : 'var(--text)',
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = 'var(--bg-subtle)';
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = 'transparent';
        }}
      >
        <span className="flex items-center gap-2.5">
          <span style={{ color: active ? 'var(--accent)' : colorMap[color] }}>{icon}</span>
          <span className={active ? 'font-semibold' : ''}>{label}</span>
        </span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {count}
        </span>
      </button>
    </li>
  );
}

function CategoryItem({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        aria-current={active ? 'true' : undefined}
        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors text-left"
        style={{
          background: active ? 'var(--accent-soft)' : 'transparent',
          color: active ? 'var(--accent-text)' : 'var(--text)',
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = 'var(--bg-subtle)';
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = 'transparent';
        }}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          <Icon.ChevronRight
            width={14}
            height={14}
            style={{ color: 'var(--text-subtle)', flexShrink: 0 }}
          />
          <span className={`truncate ${active ? 'font-semibold' : ''}`}>{label}</span>
        </span>
        <span className="text-xs tabular-nums shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
          {count}
        </span>
      </button>
    </li>
  );
}
