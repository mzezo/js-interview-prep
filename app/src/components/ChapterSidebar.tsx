'use client';

import Link from 'next/link';
import type { Chapter } from '@/lib/content';

interface ChapterSidebarProps {
    chapters: Chapter[];
    currentSlug: string;
}

export function ChapterSidebar({ chapters, currentSlug }: ChapterSidebarProps) {
    return (
        <aside
            className="md:sticky md:top-16 md:self-start md:h-[calc(100vh-4rem)] md:overflow-y-auto thin-scroll w-full md:w-72 shrink-0 border-r p-4 space-y-6"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
            aria-label="Chapters navigation"
        >
            <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Chapters
                </h2>
                <ul className="space-y-0.5">
                    {chapters.map((chapter) => {
                        const active = chapter.slug === currentSlug;
                        return (
                            <li key={chapter.slug}>
                                <Link
                                    href={`/chapters/${chapter.slug}/`}
                                    aria-current={active ? 'true' : undefined}
                                    className="flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors"
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
                                    <span className={active ? 'font-semibold' : ''}>{chapter.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </aside>
    );
}
