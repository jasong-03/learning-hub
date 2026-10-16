import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { EmptyState, HubPage } from '@/components/hub/hub-page';
import { LabsIndex } from '@/components/hub/labs-index';
import { getMDXComponents } from '@/components/mdx';
import { catalog } from '@/lib/catalog';
import { source } from '@/lib/source';

export async function generateMetadata({ params }: PageProps<'/courses/[courseId]/labs'>): Promise<Metadata> {
  const { courseId } = await params;
  return { title: `Labs · ${catalog.getCourse(courseId)?.title ?? ''}` };
}

/** All labs of a course in authored order; renders the course's labs/index.md intro when present. */
export default async function CourseLabsPage({ params }: PageProps<'/courses/[courseId]/labs'>) {
  const { courseId } = await params;
  const course = catalog.getCourse(courseId);
  if (!course) notFound();
  const intro = source.getPage([courseId, 'labs']);
  const labs = catalog.data.labs.filter((lab) => lab.courseId === courseId);
  const Intro = intro?.data.body;

  return (
    <HubPage title={intro?.data.title ?? `${course.title} labs`} description={intro?.data.description}>
      {Intro && intro && (
        <div className="prose max-w-none text-sm">
          <Intro components={getMDXComponents({ a: createRelativeLink(source, intro) })} />
        </div>
      )}
      {labs.length === 0 ? <EmptyState>This course has no labs yet.</EmptyState> : <LabsIndex labIds={labs.map((lab) => lab.id)} />}
    </HubPage>
  );
}
