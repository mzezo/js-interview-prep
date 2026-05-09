import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Chapter {
  slug: string;
  title: string;
  order: number;
  content: string;
}

const contentDir = path.join(process.cwd(), 'content');

export function getAllChapters(): Chapter[] {
  if (!fs.existsSync(contentDir)) return [];

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'));

  const chapters = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.md$/, ''),
      title: data.title ?? file,
      order: data.order ?? 999,
      content,
    };
  });

  return chapters.sort((a, b) => a.order - b.order);
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  return getAllChapters().find((c) => c.slug === slug);
}
