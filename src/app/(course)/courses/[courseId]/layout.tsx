import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { notFound } from 'next/navigation';
import { catalog } from '@/lib/catalog';
import { baseOptions, hubLinks } from '@/lib/layout.shared';
import { buildCourseTree } from '@/lib/navigation';

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.data.courses.map((course) => ({ courseId: course.id }));
}

export default async function CourseLayout({ children, params }: LayoutProps<'/courses/[courseId]'>) {
  const { courseId } = await params;
  if (!catalog.getCourse(courseId)) notFound();

  return (
    <DocsLayout tree={buildCourseTree(courseId)} {...baseOptions()} links={hubLinks}>
      {children}
    </DocsLayout>
  );
}
