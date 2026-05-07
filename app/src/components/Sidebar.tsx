import Link from 'next/link';
import type { Chapter } from '@/lib/content';

export function Sidebar({ chapters, currentSlug }: { chapters: Chapter[]; currentSlug?: string }) {
  return (
    <nav
      aria-label="Chapter navigation"
      className="w-full md:w-72 md:sticky md:top-0 md:h-screen md:overflow-y-auto p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800"
    >
      <Link
        href="/"
        className="block text-lg font-bold mb-4 hover:text-blue-600 dark:hover:text-blue-400"
      >
        JS Interview Prep
      </Link>
      <ol className="space-y-1">
        {chapters.map((c) => {
          const active = c.slug === currentSlug;
          return (
            <li key={c.slug}>
              <Link
                href={`/chapters/${c.slug}/`}
                aria-current={active ? 'page' : undefined}
                className={`block px-3 py-2 rounded text-sm ${
                  active
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-gray-500 dark:text-gray-400 mr-2">
                  {String(c.order).padStart(2, '0')}
                </span>
                {c.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
