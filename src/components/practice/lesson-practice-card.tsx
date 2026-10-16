import Link from 'next/link';
import { MessagesSquare } from 'lucide-react';
import type { LearningItem } from '@/domain/types';
import { QuestionStatsLine } from '@/components/practice/question-stats-line';
import { catalog } from '@/lib/catalog';

/** On a lesson that has (or is practiced by) a question set: jump into practice for that topic. */
export function LessonPracticeCard({ item }: { item: LearningItem }) {
  const course = catalog.getCourse(item.courseId);
  const sets = catalog.lessonQuestionSets(item.id);
  if (!course?.questionsUrl || sets.length === 0) return null;
  return (
    <section aria-label="Practice questions" className="not-prose my-6 rounded-xl border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <MessagesSquare className="size-4 text-primary" aria-hidden />
        Practice questions
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {sets.map((set) => (
          <li key={set.id}>
            <Link
              href={`${course.questionsUrl}?mode=practice&set=${encodeURIComponent(set.id)}`}
              className="flex h-full flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <span className="font-medium">
                {set.topic}: {set.counts.total} questions
              </span>
              <QuestionStatsLine questionIds={set.questionIds} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
