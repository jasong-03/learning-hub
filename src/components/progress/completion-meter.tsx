'use client';

import { Progress } from '@/components/ui/progress';
import { completionOf } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';
import { cn } from '@/lib/utils';

interface CompletionMeterProps {
  /** Lesson and lab ids whose completion is measured. */
  itemIds: string[];
  label: string;
  variant?: 'bar' | 'full';
  className?: string;
}

/** Progress bar with "done/total" for any set of items: a course, module or path. */
export function CompletionMeter({ itemIds, label, variant = 'bar', className }: CompletionMeterProps) {
  const stats = completionOf(itemIds.map((id) => ({ id })), useProgress());
  if (stats.total === 0) return <p className={cn('text-xs text-muted-foreground', className)}>No lessons yet</p>;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {variant === 'full' && (
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-semibold tabular-nums">{stats.percent}%</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {stats.done}/{stats.total} completed
          </span>
        </div>
      )}
      <Progress value={stats.percent} aria-label={`${label} progress`} />
      {variant === 'bar' && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {stats.done}/{stats.total} completed · {stats.percent}%
        </span>
      )}
    </div>
  );
}
