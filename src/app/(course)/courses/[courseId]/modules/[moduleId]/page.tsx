import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState, HubPage, SectionHeading } from '@/components/hub/hub-page';
import { ItemList } from '@/components/hub/item-list';
import { NextStepButton } from '@/components/hub/next-step-button';
import { CompletionMeter } from '@/components/progress/completion-meter';
import { catalog } from '@/lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.data.modules.map((learningModule) => ({ courseId: learningModule.courseId, moduleId: learningModule.localId }));
}

export async function generateMetadata({ params }: PageProps<'/courses/[courseId]/modules/[moduleId]'>): Promise<Metadata> {
  const { courseId, moduleId } = await params;
  const learningModule = catalog.getModule(`${courseId}:${moduleId}`);
  return { title: learningModule?.title, description: learningModule?.description };
}

/** Module overview: its lessons and labs with progress, plus any question sets that practice them. */
export default async function ModulePage({ params }: PageProps<'/courses/[courseId]/modules/[moduleId]'>) {
  const { courseId, moduleId } = await params;
  const course = catalog.getCourse(courseId);
  const learningModule = catalog.getModule(`${courseId}:${moduleId}`);
  if (!course || !learningModule) notFound();
  const items = catalog.moduleItems(learningModule.id);
  const sets = catalog.courseQuestionSets(courseId).filter((set) => items.some((item) => item.id === set.lessonId || set.relatedLessonIds.includes(item.id)));

  return (
    <HubPage title={learningModule.title} description={learningModule.description} actions={<NextStepButton itemIds={items.map((item) => item.id)} />}>
      <p className="text-sm">
        <Link href={course.url} className="text-primary hover:underline">
          {course.title}
        </Link>
      </p>
      {items.length === 0 ? (
        <EmptyState>No lessons in this module yet.</EmptyState>
      ) : (
        <>
          <CompletionMeter variant="full" itemIds={items.map((item) => item.id)} label={learningModule.title} className="rounded-xl border bg-card p-5" />
          <section>
            <SectionHeading>Lessons</SectionHeading>
            <div className="rounded-xl border bg-card p-3">
              <ItemList items={items} columns={1} />
            </div>
          </section>
        </>
      )}
      {sets.length > 0 && course.questionsUrl && (
        <section>
          <SectionHeading>Practice</SectionHeading>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sets.map((set) => (
              <li key={set.id}>
                <Link href={`${course.questionsUrl}?mode=practice&set=${encodeURIComponent(set.id)}`} className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 text-sm hover:border-primary/50">
                  <span className="font-medium">{set.topic} questions</span>
                  <span className="text-xs text-muted-foreground">
                    {set.counts.total} questions · {set.counts.multipleChoice} multiple choice · {set.counts.openEnded} open-ended
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </HubPage>
  );
}
