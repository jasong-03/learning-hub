import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LessonView } from '@/components/lesson/lesson-view';
import { catalog } from '@/lib/catalog';
import { source } from '@/lib/source';

export const dynamicParams = false;

function resolve(courseId: string, slug: string[]) {
  const page = source.getPage([courseId, 'learn', ...slug]);
  const lesson = catalog.data.lessons.find((candidate) => candidate.url === page?.url);
  return page && lesson ? { page, item: { kind: 'lesson' as const, ...lesson } } : null;
}

export default async function LessonPage({ params }: PageProps<'/courses/[courseId]/learn/[...slug]'>) {
  const { courseId, slug } = await params;
  const resolved = resolve(courseId, slug);
  if (!resolved) notFound();
  return <LessonView page={resolved.page} item={resolved.item} />;
}

export function generateStaticParams() {
  return catalog.data.lessons.map((lesson) => ({
    courseId: lesson.courseId,
    slug: lesson.url.split('/').slice(4),
  }));
}

export async function generateMetadata({ params }: PageProps<'/courses/[courseId]/learn/[...slug]'>): Promise<Metadata> {
  const { courseId, slug } = await params;
  const resolved = resolve(courseId, slug);
  if (!resolved) notFound();
  return { title: resolved.page.data.title, description: resolved.page.data.description };
}
