import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LessonView } from '@/components/lesson/lesson-view';
import { catalog } from '@/lib/catalog';
import { source } from '@/lib/source';

export const dynamicParams = false;

/** `labId` is the lab's URL slug (its file name), e.g. lab-06-pods-replicasets-and-deployments. */
function resolve(courseId: string, labId: string) {
  const page = source.getPage([courseId, 'labs', labId]);
  const lab = catalog.data.labs.find((candidate) => candidate.url === page?.url);
  return page && lab ? { page, item: { kind: 'lab' as const, ...lab } } : null;
}

export default async function LabPage({ params }: PageProps<'/courses/[courseId]/labs/[labId]'>) {
  const { courseId, labId } = await params;
  const resolved = resolve(courseId, labId);
  if (!resolved) notFound();
  return <LessonView page={resolved.page} item={resolved.item} />;
}

export function generateStaticParams() {
  return catalog.data.labs.map((lab) => ({ courseId: lab.courseId, labId: lab.url.split('/').pop() ?? '' }));
}

export async function generateMetadata({ params }: PageProps<'/courses/[courseId]/labs/[labId]'>): Promise<Metadata> {
  const { courseId, labId } = await params;
  const resolved = resolve(courseId, labId);
  if (!resolved) notFound();
  return { title: resolved.page.data.title, description: resolved.page.data.description };
}
