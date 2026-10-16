'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FilterGroup } from '@/components/hub/course-catalog';
import { ItemStatusIcon } from '@/components/progress/item-status-icon';
import { catalog } from '@/lib/catalog';
import { checklistCompletionOf, itemStatus, type ItemStatus } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

const STATUS_OPTIONS: { value: 'all' | ItemStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'complete', label: 'Done' },
];

/** Hands-on practice across courses: every lab and quiz, filterable by course and status. */
export function PracticeBoard() {
  const progress = useProgress();
  const [courseId, setCourseId] = useState('all');
  const [status, setStatus] = useState('all');
  const coursesWithPractice = catalog.data.courses.filter((course) =>
    catalog.data.labs.some((lab) => lab.courseId === course.id) || catalog.data.quizzes.some((quiz) => quiz.courseId === course.id),
  );
  const labs = catalog.data.labs
    .filter((lab) => courseId === 'all' || lab.courseId === courseId)
    .map((lab) => ({ kind: 'lab' as const, ...lab }))
    .filter((lab) => status === 'all' || itemStatus(lab, progress) === status);
  const quizzes = catalog.data.quizzes.filter((quiz) => courseId === 'all' || quiz.courseId === courseId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <FilterGroup
          label="Course"
          value={courseId}
          onChange={setCourseId}
          options={[{ value: 'all', label: 'All' }, ...coursesWithPractice.map((course) => ({ value: course.id, label: course.title }))]}
        />
        <FilterGroup label="Labs" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Quizzes</h2>
        {quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quizzes for this course yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {quizzes.map((quiz) => {
              const lesson = catalog.getLesson(quiz.lessonId);
              const result = progress.quizzes[quiz.id];
              return (
                <li key={quiz.id}>
                  <Link href={`${lesson?.url ?? '#'}#quiz`} className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 text-sm hover:border-primary/50">
                    <span className="font-medium">{quiz.title}</span>
                    <span className="text-xs text-muted-foreground">{lesson?.title}</span>
                    <span className="mt-1 text-xs tabular-nums">
                      {result ? `Best ${result.bestScore}/${result.total} · last ${result.lastScore}/${result.total}` : `${quiz.questions.length} questions · not attempted`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Labs <span className="text-sm font-normal text-muted-foreground tabular-nums">({labs.length})</span>
        </h2>
        {labs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No labs match these filters.</p>
        ) : (
          <ol className="divide-y rounded-xl border bg-card">
            {labs.map((lab) => {
              const steps = checklistCompletionOf(lab, progress);
              return (
                <li key={lab.id}>
                  <Link href={lab.url} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent">
                    <ItemStatusIcon item={lab} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug">{lab.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {catalog.getCourse(lab.courseId)?.title} · {catalog.getModule(lab.moduleId)?.title}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:inline">
                      {steps.done}/{steps.total} steps
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
