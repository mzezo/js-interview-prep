import { Sidebar } from '@/components/Sidebar';
import { getAllChapters } from '@/lib/content';
import Link from 'next/link';

export default function HomePage() {
  const chapters = getAllChapters();

  return (
    <div className="md:flex min-h-screen">
      <Sidebar chapters={chapters} />
      <main id="main-content" className="flex-1 p-6 md:p-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-3">JavaScript Interview Prep</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          A practical, problem-driven study guide for mid-level engineers.
        </p>

        <section aria-labelledby="chapters-heading">
          <h2 id="chapters-heading" className="text-2xl font-semibold mb-4">
            Chapters
          </h2>
          <ul className="space-y-2">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/chapters/${c.slug}/`}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Chapter {c.order}
                  </span>
                  <h3 className="font-semibold mt-1">{c.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
