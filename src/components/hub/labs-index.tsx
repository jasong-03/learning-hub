'use client';

import Link from 'next/link';
import { ItemStatusIcon } from '@/components/progress/item-status-icon';
import { catalog } from '@/lib/catalog';
import { checklistCompletionOf, completionOf } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

/** Labs in authored order with module, step progress and completion. */
export function LabsIndex({ labIds }: { labIds: string[] }) {
  const progress = useProgress();
  const labs = labIds.flatMap((id) => {
    const lab = catalog.getLab(id);
    return lab ? [{ kind: 'lab' as const, ...lab }] : [];
  });
  const stats = completionOf(labs, progress);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground tabular-nums">
        {stats.done} of {stats.total} labs completed
      </p>
      <ol className="divide-y rounded-xl border bg-card">
        {labs.map((lab) => {
          const steps = checklistCompletionOf(lab, progress);
          return (
            <li key={lab.id}>
              <Link href={lab.url} className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent">
                <ItemStatusIcon item={lab} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{lab.title}</span>
                  <span className="text-xs text-muted-foreground">{catalog.getModule(lab.moduleId)?.title}</span>
                </span>
                <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:inline">
                  {steps.done}/{steps.total} steps
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
