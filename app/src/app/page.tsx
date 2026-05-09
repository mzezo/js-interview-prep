'use client';

import { useEffect, useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Sidebar, type StatusFilter } from '@/components/Sidebar';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizMode } from '@/components/QuizMode';
import { StatsModal } from '@/components/StatsModal';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { Icon } from '@/components/Icon';
import { useProgress } from '@/hooks/useProgress';
import { useTheme } from '@/hooks/useTheme';
import { allQuestions } from '@/data/questions';
import { categories } from '@/data/categories';
import type { Status } from '@/lib/types';

export default function HomePage() {
  // ── State ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [showQuiz, setShowQuiz] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { getStatus, isBookmarked, setStatus, toggleBookmark, reset, hydrated, progress } = useProgress();
  const { toggle: toggleTheme } = useTheme();

  // ── Counts (memoized) ─────────────────────────────────────
  const counts = useMemo(() => {
    const result = {
      all: allQuestions.length,
      notStarted: 0,
      studied: 0,
      needsReview: 0,
      mastered: 0,
      bookmarked: progress.bookmarks.length,
      byCategory: {} as Record<string, { total: number; completed: number; mastered: number }>,
    };

    for (const cat of categories) {
      result.byCategory[cat.id] = { total: 0, completed: 0, mastered: 0 };
    }

    for (const q of allQuestions) {
      const s = getStatus(q.id);
      if (s === 'not-started') result.notStarted++;
      else if (s === 'studied') result.studied++;
      else if (s === 'needs-review') result.needsReview++;
      else if (s === 'mastered') result.mastered++;

      const cat = result.byCategory[q.category];
      if (cat) {
        cat.total++;
        if (s !== 'not-started') cat.completed++;
        if (s === 'mastered') cat.mastered++;
      }
    }

    return result;
  }, [progress, getStatus]);

  const completedCount = counts.studied + counts.needsReview + counts.mastered;

  // ── Filtered questions ────────────────────────────────────
  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allQuestions.filter((question) => {
      // Status filter
      if (statusFilter === 'bookmarked') {
        if (!isBookmarked(question.id)) return false;
      } else if (statusFilter !== 'all') {
        if (getStatus(question.id) !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && question.category !== categoryFilter) return false;

      // Search filter (title + answer body)
      if (q) {
        const inTitle = question.title.toLowerCase().includes(q);
        const inAnswer = question.answer.toLowerCase().includes(q);
        const inHint = question.hint?.toLowerCase().includes(q) ?? false;
        if (!inTitle && !inAnswer && !inHint) return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, categoryFilter, getStatus, isBookmarked]);

  // ── Card expand/collapse handler ─────────────────────────
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Global keyboard shortcuts ─────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (e.key === 'Escape') {
        if (showQuiz) return setShowQuiz(false);
        if (showStats) return setShowStats(false);
        if (showShortcuts) return setShowShortcuts(false);
        if (searchQuery && inField && target?.tagName === 'INPUT') {
          setSearchQuery('');
          (target as HTMLInputElement).blur();
        }
        return;
      }

      if (inField) return; // don't intercept while typing in inputs

      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setShowQuiz(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowStats(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQuiz, showStats, showShortcuts, searchQuery, toggleTheme]);

  // ── Reset filters when nothing matches ────────────────────
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopBar
        completedCount={completedCount}
        totalCount={counts.all}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onQuizClick={() => setShowQuiz(true)}
        onStatsClick={() => setShowStats(true)}
        onShortcutsClick={() => setShowShortcuts(true)}
      />

      <div className="flex flex-col md:flex-row">
        <Sidebar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          counts={counts}
        />

        <main
          id="main-content"
          className="flex-1 px-4 md:px-6 py-6 max-w-5xl mx-auto w-full"
          tabIndex={-1}
        >
          {/* Header showing filter context */}
          <div className="mb-5 flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
              {statusFilter !== 'all' && (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  {' '}
                  · {statusFilter === 'bookmarked' ? 'bookmarked' : statusFilter.replace('-', ' ')}
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                  {' '}
                  · {categories.find((c) => c.id === categoryFilter)?.label}
                </span>
              )}
            </h2>

            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Question list */}
          {filteredQuestions.length === 0 ? (
            <div
              className="text-center py-16 rounded-lg border-2 border-dashed"
              style={{ borderColor: 'var(--border)' }}
            >
              <Icon.Search
                width={32}
                height={32}
                style={{ color: 'var(--text-subtle)', margin: '0 auto 12px' }}
              />
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                No questions match your filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-3 text-sm font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredQuestions.map((q) => (
                <li key={q.id}>
                  <QuestionCard
                    question={q}
                    expanded={expandedIds.has(q.id)}
                    status={getStatus(q.id)}
                    bookmarked={isBookmarked(q.id)}
                    onToggleExpand={() => toggleExpanded(q.id)}
                    onStatusChange={(s: Status) => setStatus(q.id, s)}
                    onToggleBookmark={() => toggleBookmark(q.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <footer
            className="mt-12 pt-6 border-t text-center text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Built for mid-level frontend engineers preparing for interviews. Press{' '}
            <kbd
              className="px-1.5 py-0.5 text-[10px] rounded border font-mono"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
            >
              ?
            </kbd>{' '}
            for shortcuts.
          </footer>
        </main>
      </div>

      {/* Modals */}
      {showQuiz && (
        <QuizMode
          questions={filteredQuestions.length > 0 ? filteredQuestions : allQuestions}
          onClose={() => setShowQuiz(false)}
          getStatus={getStatus}
          setStatus={setStatus}
        />
      )}
      {showStats && <StatsModal onClose={() => setShowStats(false)} onReset={reset} counts={counts} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* Hydration suppression - hide nothing until ready to avoid flash */}
      {!hydrated && (
        <div aria-hidden="true" style={{ display: 'none' }}>
          {/* placeholder — hydration just needs to occur */}
        </div>
      )}
    </div>
  );
}
