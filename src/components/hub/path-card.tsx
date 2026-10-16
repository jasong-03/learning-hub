import Link from 'next/link';
import { Route } from 'lucide-react';
import type { LearningPath } from '@/domain/types';
import { CompletionMeter } from '@/components/progress/completion-meter';
import { catalog } from '@/lib/catalog';

export function PathCard({ learningPath }: { learningPath: LearningPath }) {
  const courseTitles = [...new Set(learningPath.items.map((item) => catalog.getCourse(item.courseId)?.title))].filter(Boolean);
  return (
    <Link href={learningPath.url} className="flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-2">
        <Route className="size-4 text-primary" aria-hidden />
        <h3 className="font-semibold">{learningPath.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{learningPath.description}</p>
      <p className="text-xs text-muted-foreground">
        {learningPath.items.length} steps · {courseTitles.join(', ')}
      </p>
      <CompletionMeter className="mt-auto" itemIds={catalog.pathItems(learningPath.id).map((item) => item.id)} label={learningPath.title} />
    </Link>
  );
}
