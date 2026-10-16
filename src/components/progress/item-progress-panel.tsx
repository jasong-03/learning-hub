'use client';

import { useEffect } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { LearningItem } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { checklistCompletionOf } from '@/lib/progress/stats';
import { recordVisit, setItemComplete, useProgress } from '@/lib/progress/store';

/** "Mark as complete" control at the end of every lesson and lab; also records the visit for "Continue learning". */
export function ItemProgressPanel({ item }: { item: LearningItem }) {
  const progress = useProgress();
  const completedAt = progress.completed[item.id]?.completedAt;
  const checklist = item.kind === 'lab' ? checklistCompletionOf(item, progress) : null;
  const isChecklistDone = checklist !== null && checklist.total > 0 && checklist.done === checklist.total;

  // Syncs an external system (localStorage) with the page being viewed.
  useEffect(() => {
    recordVisit(item.courseId, item.id);
  }, [item.courseId, item.id]);

  return (
    <section
      aria-label="Progress"
      className="not-prose mt-10 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="text-sm">
        {completedAt ? (
          <p className="flex items-center gap-2 font-medium text-success">
            <CheckCircle2 className="size-4" />
            Completed on {new Date(completedAt).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-muted-foreground">
            {isChecklistDone
              ? 'All lab steps are checked. Mark the lab as complete.'
              : `Finished this ${item.kind}? Mark it as complete to track your progress.`}
          </p>
        )}
      </div>
      {completedAt ? (
        <Button variant="outline" onClick={() => setItemComplete(item.id, false)}>
          <RotateCcw />
          Mark as not complete
        </Button>
      ) : (
        <Button onClick={() => setItemComplete(item.id, true)}>
          <CheckCircle2 />
          Mark as complete
        </Button>
      )}
    </section>
  );
}
