import Link from 'next/link';
import type { LearningItem } from '@/domain/types';
import { ItemStatusIcon } from '@/components/progress/item-status-icon';
import { catalog, itemLabel } from '@/lib/catalog';

/** Labs for a lesson, or the lessons that point to a lab (relations come from content metadata). */
export function RelatedItems({ item }: { item: LearningItem }) {
  const ids = item.kind === 'lab' ? item.relatedLessonIds : item.relatedLabIds;
  const related = ids.flatMap((id) => catalog.getItem(id) ?? []);
  if (related.length === 0) return null;
  const heading = item.kind === 'lab' ? 'Related lessons' : 'Practice labs';

  return (
    <section aria-label={heading} className="not-prose my-6 rounded-xl border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{heading}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {related.map((relatedItem) => (
          <li key={relatedItem.id}>
            <Link
              href={relatedItem.url}
              className="flex h-full items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <ItemStatusIcon item={relatedItem} className="mt-0.5" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium leading-snug">{relatedItem.title}</span>
                <span className="text-xs text-muted-foreground">
                  {itemLabel(relatedItem)} · {catalog.getModule(relatedItem.moduleId)?.title}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
