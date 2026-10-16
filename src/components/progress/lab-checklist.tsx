'use client';

import { ListChecks } from 'lucide-react';
import type { Lab } from '@/domain/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { checklistCompletionOf } from '@/lib/progress/stats';
import { setChecklistItem, useProgress } from '@/lib/progress/store';

/** Step checklist built from the lab's "Step N" headings; each label jumps to its section. */
export function LabChecklist({ lab }: { lab: Lab }) {
  const progress = useProgress();
  if (lab.checklist.length === 0) return null;
  const stats = checklistCompletionOf(lab, progress);

  return (
    <section aria-label="Lab checklist" className="not-prose my-6 rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="size-4 text-primary" />
          Lab checklist
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {stats.done}/{stats.total} steps
        </span>
      </div>
      <Progress value={stats.percent} aria-label="Lab checklist progress" className="mb-4" />
      <ul className="flex flex-col gap-2">
        {lab.checklist.map((item) => {
          const isChecked = Boolean(progress.checklist[item.id]);
          return (
            <li key={item.id} className="flex items-start gap-3">
              <Checkbox
                className="mt-0.5"
                checked={isChecked}
                onCheckedChange={(checked) => setChecklistItem(item.id, checked === true)}
                aria-label={`Mark "${item.label}" as done`}
              />
              <a
                href={`#${item.anchor}`}
                className={
                  isChecked
                    ? 'text-sm text-muted-foreground line-through decoration-muted-foreground/50'
                    : 'text-sm hover:text-primary'
                }
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
