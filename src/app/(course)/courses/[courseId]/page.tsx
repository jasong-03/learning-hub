import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CourseSource } from '@/components/hub/course-source';
import { EmptyState, HubPage, SectionHeading } from '@/components/hub/hub-page';
import { QuestionBankSummary } from '@/components/practice/question-bank-summary';
import { ItemList } from '@/components/hub/item-list';
import { NextStepButton } from '@/components/hub/next-step-button';
import { LucideIcon } from '@/components/lucide-icon';
import { CompletionMeter } from '@/components/progress/completion-meter';
import { Badge } from '@/components/ui/badge';
import { LEVEL_LABELS, catalog } from '@/lib/catalog';

export async function generateMetadata({ params }: PageProps<'/courses/[courseId]'>): Promise<Metadata> {
  const { courseId } = await params;
  const course = catalog.getCourse(courseId);
  return { title: course?.title, description: course?.description };
}

export default async function CourseOverviewPage({ params }: PageProps<'/courses/[courseId]'>) {
  const { courseId } = await params;
  const course = catalog.getCourse(courseId);
  if (!course) notFound();
  const items = catalog.courseItems(courseId);
  const itemIds = items.map((item) => item.id);

  return (
    <HubPage title={course.title} description={course.description} actions={<NextStepButton itemIds={itemIds} courseId={courseId} />}>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{catalog.getCategory(course.categoryId)?.title}</Badge>
        <Badge variant="outline">{LEVEL_LABELS[course.level]}</Badge>
        <Badge variant="outline">Content language: {course.language}</Badge>
        {course.status === 'planned' && <Badge variant="secondary">Planned</Badge>}
      </div>
      {items.length > 0 ? (
        <CompletionMeter variant="full" itemIds={itemIds} label={course.title} className="rounded-xl border bg-card p-5" />
      ) : (
        <EmptyState>This course is planned. Its modules are outlined below; lessons will appear here once they are written.</EmptyState>
      )}
      <QuestionBankSummary course={course} />
      <section>
        <SectionHeading>Modules</SectionHeading>
        <ol className="flex flex-col gap-4">
          {catalog.courseModules(courseId).map((learningModule, index) => {
            const moduleItems = catalog.moduleItems(learningModule.id);
            return (
              <li key={learningModule.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <LucideIcon name={learningModule.icon} className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Module {index + 1}</p>
                      <h3 className="font-semibold">
                        <Link href={`${course.url}/modules/${learningModule.localId}`} className="hover:text-primary">
                          {learningModule.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{learningModule.description}</p>
                    </div>
                  </div>
                  {moduleItems.length > 0 && (
                    <CompletionMeter className="sm:w-56" itemIds={moduleItems.map((item) => item.id)} label={learningModule.title} />
                  )}
                </div>
                {moduleItems.length > 0 && (
                  <div className="mt-4">
                    <ItemList items={moduleItems} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      <CourseSource course={course} />
    </HubPage>
  );
}
