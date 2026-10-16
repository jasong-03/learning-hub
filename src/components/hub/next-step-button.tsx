'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { catalog } from '@/lib/catalog';
import { nextItem } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

/** Links to the first unfinished item of an ordered set (a course or path). */
export function NextStepButton({ itemIds, courseId }: { itemIds: string[]; courseId?: string }) {
  const progress = useProgress();
  const items = itemIds.flatMap((id) => catalog.getItem(id) ?? []);
  const next = nextItem(items, progress, courseId ? progress.lastVisited[courseId]?.itemId : undefined);
  if (!next) return null;
  const hasStarted = items.some((item) => progress.completed[item.id]) || (courseId !== undefined && progress.lastVisited[courseId]);
  return (
    <Link href={next.url} className={buttonVariants()}>
      {hasStarted ? 'Continue' : 'Start'}
      <ArrowRight />
    </Link>
  );
}
