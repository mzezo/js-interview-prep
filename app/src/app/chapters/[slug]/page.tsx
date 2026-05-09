import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChapterSidebar } from '@/components/ChapterSidebar';
import { MarkdownContent } from '@/components/MarkdownContent';
import { getAllChapters, getChapterBySlug } from '@/lib/content';

export function generateStaticParams() {
  return getAllChapters().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const chapter = getChapterBySlug(params.slug);
  return { title: chapter ? `${chapter.title} — JS Interview Prep` : 'Not found' };
}

export default function ChapterPage({ params }: { params: { slug: string } }) {
  const chapter = getChapterBySlug(params.slug);
  if (!chapter) notFound();

  const chapters = getAllChapters();
  const idx = chapters.findIndex((c) => c.slug === chapter.slug);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <div className="md:flex min-h-screen">
      <ChapterSidebar chapters={chapters} currentSlug={chapter.slug} />
      <main id="main-content" className="flex-1 p-6 md:p-12 max-w-4xl">
        <MarkdownContent>{chapter.content}</MarkdownContent>

        <nav
          aria-label="Chapter pagination"
          className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-4"
        >
          {prev ? (
            <Link
              href={`/chapters/${prev.slug}/`}
              className="text-sm hover:underline"
              rel="prev"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/chapters/${next.slug}/`}
              className="text-sm hover:underline text-right"
              rel="next"
            >
              {next.title} →
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
