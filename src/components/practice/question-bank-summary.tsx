import Link from 'next/link';
import { MessagesSquare } from 'lucide-react';
import type { Course } from '@/domain/types';
import { QuestionStatsLine } from '@/components/practice/question-stats-line';
import { SectionHeading } from '@/components/hub/hub-page';
import { catalog } from '@/lib/catalog';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;

/** Course-overview entry point to the question bank: practice by topic or difficulty, or review. */
export function QuestionBankSummary({ course }: { course: Course }) {
  const sets = catalog.courseQuestionSets(course.id);
  if (!course.questionsUrl || sets.length === 0) return null;
  const allIds = sets.flatMap((set) => set.questionIds);
  const count = (key: 'easy' | 'medium' | 'hard'): number => sets.reduce((sum, set) => sum + (set.counts[key] ?? 0), 0);

  return (
    <section>
      <SectionHeading action={<Link href={course.questionsUrl} className="text-sm font-medium text-primary hover:underline">Open question bank</Link>}>
        Interview practice
      </SectionHeading>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2 font-semibold">
            <MessagesSquare className="size-4 text-primary" aria-hidden />
            {allIds.length} questions in {sets.length} topics
          </p>
          <QuestionStatsLine questionIds={allIds} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Practice by topic</p>
          <ul className="flex flex-wrap gap-2">
            {sets.map((set) => (
              <li key={set.id}>
                <Link href={`${course.questionsUrl}?mode=practice&set=${encodeURIComponent(set.id)}`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs hover:bg-accent">
                  {set.topic}
                  <span className="text-muted-foreground tabular-nums">{set.counts.total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Practice by difficulty</p>
          <ul className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <li key={difficulty.value}>
                <Link href={`${course.questionsUrl}?mode=practice&difficulty=${difficulty.value}`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs hover:bg-accent">
                  {difficulty.label}
                  <span className="text-muted-foreground tabular-nums">{count(difficulty.value)}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={`${course.questionsUrl}?mode=review`} className="inline-flex items-center rounded-full border px-3 py-1 text-xs hover:bg-accent">
                Review answers
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
