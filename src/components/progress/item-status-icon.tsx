'use client';

import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import type { LearningItem } from '@/domain/types';
import { itemStatus } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';
import { cn } from '@/lib/utils';

/** Completed, in progress (some lab steps checked) or not started. */
export function ItemStatusIcon({ item, className }: { item: LearningItem; className?: string }) {
  const status = itemStatus(item, useProgress());
  if (status === 'complete') return <CheckCircle2 aria-label="Completed" className={cn('size-4 shrink-0 text-success', className)} />;
  if (status === 'in-progress') return <CircleDot aria-label="In progress" className={cn('size-4 shrink-0 text-primary', className)} />;
  return <Circle aria-label="Not started" className={cn('size-4 shrink-0 text-muted-foreground/60', className)} />;
}
