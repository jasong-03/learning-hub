'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { HtmlContent } from '@/components/practice/html-content';
import { catalog, itemLabel, itemTitle } from '@/lib/catalog';
import { checklistCompletionOf, labsInProgress, needsReview, oldestCompleted, quizzesToRetake } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

const REVISIT_LIMIT = 8;
const QUESTION_LIMIT = 10;

export interface ReviewQuestion {
  id: string;
  label: string;
  promptHtml: string;
  topic: string;
  courseTitle: string;
  reviewUrl: string;
}

/** What to review next: questions answered wrong or marked for review, missed quizzes, labs left half-done, and the lessons finished longest ago. */
export function ReviewBoard({ questions }: { questions: ReviewQuestion[] }) {
  const progress = useProgress();
  const flagged = questions
    .filter((question) => needsReview(question.id, progress))
    .sort((a, b) => (progress.questions[b.id]?.lastAt ?? '').localeCompare(progress.questions[a.id]?.lastAt ?? ''));
  const retake = quizzesToRetake(catalog.data.quizzes, progress);
  const unfinishedLabs = labsInProgress(catalog.data.labs, progress);
  const revisit = oldestCompleted(catalog.data.lessons.map((lesson) => ({ kind: 'lesson' as const, ...lesson })), progress).slice(0, REVISIT_LIMIT);

  return (
    <div className="flex flex-col gap-8">
      <ReviewSection title={`Questions to review${flagged.length > QUESTION_LIMIT ? ` (${flagged.length})` : ''}`} empty={'Questions you answer incorrectly or mark “Review again” in a question bank appear here.'}>
        {flagged.slice(0, QUESTION_LIMIT).map((question) => (
          <li key={question.id}>
            <Link href={question.reviewUrl} className="flex flex-col gap-0.5 px-4 py-3 text-sm hover:bg-accent">
              <span className="font-medium leading-snug">
                <span className="me-1.5 text-xs text-primary">{question.label}</span>
                <HtmlContent html={question.promptHtml} inline />
              </span>
              <span className="text-xs text-muted-foreground">
                {question.topic} · {question.courseTitle}
              </span>
            </Link>
          </li>
        ))}
      </ReviewSection>
      <ReviewSection title="Quizzes to retake" empty="No missed questions. Quizzes you score below 100% appear here.">
        {retake.map((quiz) => {
          const lesson = catalog.getLesson(quiz.lessonId);
          const result = progress.quizzes[quiz.id];
          return (
            <ReviewRow key={quiz.id} href={`${lesson?.url ?? '#'}#quiz`} title={quiz.title} detail={lesson && itemTitle(lesson)}
              meta={result ? `Last ${result.lastScore}/${result.total} · ${result.incorrectQuestionIds.length} to review` : ''} />
          );
        })}
      </ReviewSection>
      <ReviewSection title="Labs in progress" empty="No half-finished labs. Labs with some steps checked appear here.">
        {unfinishedLabs.map((lab) => {
          const steps = checklistCompletionOf(lab, progress);
          return (
            <ReviewRow key={lab.id} href={lab.url} title={lab.title} detail={catalog.getCourse(lab.courseId)?.title}
              meta={`${steps.done}/${steps.total} steps`} />
          );
        })}
      </ReviewSection>
      <ReviewSection title="Revisit" empty="Completed lessons appear here, oldest first, so you can refresh them.">
        {revisit.map((lesson) => (
          <ReviewRow key={lesson.id} href={lesson.url} title={itemTitle(lesson)} detail={`${itemLabel(lesson)} · ${catalog.getCourse(lesson.courseId)?.title}`}
            meta={`Completed ${new Date(lesson.completedAt).toLocaleDateString()}`} />
        ))}
      </ReviewSection>
    </div>
  );
}

function ReviewSection({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children.length === 0 ? (
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">{children}</ul>
      )}
    </section>
  );
}

function ReviewRow({ href, title, detail, meta }: { href: string; title: string; detail?: string; meta: string }) {
  return (
    <li>
      <Link href={href} className="flex flex-col gap-0.5 px-4 py-3 text-sm hover:bg-accent sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="min-w-0">
          <span className="block font-medium leading-snug">{title}</span>
          {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</span>
      </Link>
    </li>
  );
}
