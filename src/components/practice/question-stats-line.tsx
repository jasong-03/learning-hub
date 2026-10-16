'use client';

import { questionStats } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

/** "12/50 practiced · 9 correct or known · 3 to review" for any set of question ids. */
export function QuestionStatsLine({ questionIds }: { questionIds: string[] }) {
  const stats = questionStats(questionIds, useProgress());
  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      {stats.practiced}/{stats.total} practiced · {stats.solid} correct or known · {stats.needsReview} to review
    </span>
  );
}
