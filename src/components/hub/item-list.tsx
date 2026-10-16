import Link from 'next/link';
import type { LearningItem } from '@/domain/types';
import { ItemStatusIcon } from '@/components/progress/item-status-icon';
import { itemLabel } from '@/lib/catalog';
import { cn } from '@/lib/utils';

/** Compact list of lessons/labs with completion icons. */
export function ItemList({ items, columns = 2 }: { items: LearningItem[]; columns?: 1 | 2 }) {
  return (
    <ul className={cn('grid gap-1', columns === 2 && 'sm:grid-cols-2')}>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.url} className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
            <ItemStatusIcon item={item} className="mt-0.5" />
            <span className="min-w-0 flex-1 leading-snug">{item.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{itemLabel(item)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
