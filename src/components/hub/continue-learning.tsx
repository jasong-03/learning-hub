'use client';

import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { catalog, itemLabel } from '@/lib/catalog';
import { nextItem, recentCourseIds } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

/** Next step in each recently opened course (most recent first), or a starting point for a first visit. */
export function ContinueLearning({ limit = 3 }: { limit?: number }) {
  const progress = useProgress();
  const recent = recentCourseIds(progress).filter((courseId) => catalog.getCourse(courseId));
  const courseIds = recent.length > 0 ? recent : catalog.data.courses.filter((course) => course.status === 'active').map((course) => course.id);

  const entries = courseIds
    .flatMap((courseId) => {
      const course = catalog.getCourse(courseId);
      const next = nextItem(catalog.courseItems(courseId), progress, progress.lastVisited[courseId]?.itemId);
      return course && next ? [{ course, next }] : [];
    })
    .slice(0, limit);

  if (entries.length === 0) {
    return <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Everything is complete. Pick a new course from the catalog.</p>;
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(({ course, next }, index) => (
        <li key={course.id} className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <PlayCircle className="size-3.5" />
              {recent.length > 0 ? (index === 0 ? 'Continue' : 'Pick up again') : 'Start'} · {course.title}
            </p>
            <p className="mt-2 font-semibold leading-snug">{next.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {itemLabel(next)} · {catalog.getModule(next.moduleId)?.title}
            </p>
          </div>
          <Link href={next.url} className={buttonVariants({ size: 'sm', className: 'w-fit' })}>
            {recent.length > 0 ? 'Continue' : 'Start'}
            <ArrowRight />
          </Link>
        </li>
      ))}
    </ul>
  );
}
