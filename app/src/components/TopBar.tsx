'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useTheme } from '@/hooks/useTheme';

interface TopBarProps {
  completedCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuizClick: () => void;
  onStatsClick: () => void;
  onShortcutsClick: () => void;
}

export function TopBar({
  completedCount,
  totalCount,
  searchQuery,
  onSearchChange,
  onQuizClick,
  onStatsClick,
  onShortcutsClick,
}: TopBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, toggle: toggleTheme, hydrated } = useTheme();

  // "/" focuses search (like the reference site)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        background: 'color-mix(in srgb, var(--bg-elevated) 90%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-4 px-4 md:px-6 h-16">
        {/* Logo + title block */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
          >
            <Icon.Book width={22} height={22} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold leading-tight" style={{ color: 'var(--text)' }}>
              JS Interview Prep
            </h1>
            <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>
              {completedCount}/{totalCount} completed ({percent}%)
            </p>
          </div>
        </div>

        {/* Search — flexible, centered */}
        <div className="flex-1 max-w-2xl mx-auto">
          <label className="relative block">
            <span className="sr-only">Search questions</span>
            <Icon.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-subtle)' }}
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search questions... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onQuizClick}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-white"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            aria-label="Start quiz"
          >
            <Icon.Book width={16} height={16} />
            <span className="hidden sm:inline">Quiz</span>
          </button>

          <IconButton onClick={onStatsClick} label="Statistics">
            <Icon.BarChart />
          </IconButton>

          <IconButton onClick={onShortcutsClick} label="Keyboard shortcuts">
            <Icon.Keyboard />
          </IconButton>

          <IconButton onClick={toggleTheme} label={hydrated ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : 'Toggle theme'}>
            {hydrated && theme === 'dark' ? <Icon.Moon /> : <Icon.Sun />}
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg transition-colors"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-subtle)';
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
