import Link from 'next/link';
import type { Metadata } from 'next';
import { HubPage, SectionHeading } from '@/components/hub/hub-page';
import { PracticeBoard } from '@/components/hub/practice-board';
import { QuestionStatsLine } from '@/components/practice/question-stats-line';
import { catalog } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Practice' };

export default function PracticePage() {
  const banks = catalog.data.courses.filter((course) => course.questionsUrl);
  return (
    <HubPage title="Practice" description="Question banks, labs and quizzes across your courses.">
      {banks.length > 0 && (
        <section>
          <SectionHeading>Question banks</SectionHeading>
          <ul className="grid gap-3 sm:grid-cols-2">
            {banks.map((course) => {
              const sets = catalog.courseQuestionSets(course.id);
              const ids = sets.flatMap((set) => set.questionIds);
              return (
                <li key={course.id}>
                  <Link href={course.questionsUrl ?? course.url} className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 text-sm hover:border-primary/50">
                    <span className="font-medium">{course.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {ids.length} questions · {sets.length} topics
                    </span>
                    <QuestionStatsLine questionIds={ids} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <PracticeBoard />
    </HubPage>
  );
}
