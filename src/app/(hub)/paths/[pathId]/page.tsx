import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HubPage, SectionHeading } from '@/components/hub/hub-page';
import { ItemList } from '@/components/hub/item-list';
import { NextStepButton } from '@/components/hub/next-step-button';
import { LucideIcon } from '@/components/lucide-icon';
import { CompletionMeter } from '@/components/progress/completion-meter';
import { catalog } from '@/lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.data.paths.map((learningPath) => ({ pathId: learningPath.id }));
}

export async function generateMetadata({ params }: PageProps<'/paths/[pathId]'>): Promise<Metadata> {
  const { pathId } = await params;
  return { title: catalog.getPath(pathId)?.title ?? 'Learning path' };
}

export default async function PathPage({ params }: PageProps<'/paths/[pathId]'>) {
  const { pathId } = await params;
  const learningPath = catalog.getPath(pathId);
  if (!learningPath) notFound();
  const pathItems = catalog.pathItems(pathId);

  return (
    <HubPage title={learningPath.title} description={learningPath.description} actions={<NextStepButton itemIds={pathItems.map((item) => item.id)} />}>
      <CompletionMeter variant="full" itemIds={pathItems.map((item) => item.id)} label={learningPath.title} className="rounded-xl border bg-card p-5" />
      <section>
        <SectionHeading>Steps</SectionHeading>
        <ol className="flex flex-col gap-4">
          {learningPath.items.map((step, index) => {
            const course = catalog.getCourse(step.courseId);
            const learningModule = step.type === 'module' ? catalog.getModule(`${step.courseId}:${step.moduleId}`) : undefined;
            const items = learningModule ? catalog.moduleItems(learningModule.id) : catalog.courseItems(step.courseId);
            if (!course) return null;
            return (
              <li key={`${step.type}-${step.courseId}-${learningModule?.id ?? ''}`} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums">
                      {index + 1}
                    </span>
                    <div>
                      <Link href={course.url} className="font-semibold hover:text-primary">
                        {learningModule ? learningModule.title : course.title}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <LucideIcon name={course.icon} className="size-3.5" />
                        {learningModule ? `Module of ${course.title}` : 'Whole course'}
                        {course.status === 'planned' && ' · Planned'}
                      </p>
                    </div>
                  </div>
                  <CompletionMeter className="sm:w-56" itemIds={items.map((item) => item.id)} label={learningModule?.title ?? course.title} />
                </div>
                {learningModule && items.length > 0 && (
                  <div className="mt-4">
                    <ItemList items={items} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </HubPage>
  );
}
