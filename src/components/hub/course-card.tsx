import Link from 'next/link';
import type { Course } from '@/domain/types';
import { LucideIcon } from '@/components/lucide-icon';
import { CompletionMeter } from '@/components/progress/completion-meter';
import { Badge } from '@/components/ui/badge';
import { LEVEL_LABELS, catalog } from '@/lib/catalog';

/** Course summary with category, level, status and progress. */
export function CourseCard({ course }: { course: Course }) {
  const items = catalog.courseItems(course.id);
  const labCount = items.filter((item) => item.kind === 'lab').length;
  return (
    <Link
      href={course.url}
      className="group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LucideIcon name={course.icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{course.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{catalog.getCategory(course.categoryId)?.title}</p>
        </div>
      </div>
      <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">{LEVEL_LABELS[course.level]}</Badge>
        <Badge variant="outline">{course.moduleIds.length} modules</Badge>
        {items.length > 0 && <Badge variant="outline">{items.length - labCount} lessons</Badge>}
        {labCount > 0 && <Badge variant="outline">{labCount} labs</Badge>}
        {course.status === 'planned' && <Badge variant="secondary">Planned</Badge>}
      </div>
      <CompletionMeter className="mt-auto" itemIds={items.map((item) => item.id)} label={course.title} />
    </Link>
  );
}
