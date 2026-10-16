'use client';

import { useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import type { Quiz as QuizData, QuizQuestion } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { recordQuizAttempt, useProgress } from '@/lib/progress/store';
import { isAnswerCorrect } from '@/lib/quiz-grading';
import { cn } from '@/lib/utils';

type Answers = Record<string, string[]>;

export const QUIZ_ANCHOR = 'quiz';

function isCorrect(question: QuizQuestion, selected: string[] = []): boolean {
  return isAnswerCorrect(question.correctOptionIds, selected);
}

/** Renders `backtick` spans in quiz text as inline code; everything else stays plain text. */
function QuizText({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
      <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

/** Reusable review quiz. Data is supplied per course in content/courses/<courseId>/quizzes/*.json. */
export function Quiz({ quiz }: { quiz: QuizData }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const previous = useProgress().quizzes[quiz.id];

  const answeredCount = quiz.questions.filter((question) => (answers[question.id]?.length ?? 0) > 0).length;
  const score = quiz.questions.filter((question) => isCorrect(question, answers[question.id])).length;

  const select = (question: QuizQuestion, optionId: string, isChecked: boolean): void => {
    if (isSubmitted) return;
    setAnswers((current) => {
      const isMultiple = question.correctOptionIds.length > 1;
      const selected = current[question.id] ?? [];
      const next = isMultiple
        ? isChecked
          ? [...selected, optionId]
          : selected.filter((id) => id !== optionId)
        : [optionId];
      return { ...current, [question.id]: next };
    });
  };

  const submit = (): void => {
    setIsSubmitted(true);
    recordQuizAttempt(quiz.id, {
      score,
      total: quiz.questions.length,
      incorrectQuestionIds: quiz.questions.filter((question) => !isCorrect(question, answers[question.id])).map((question) => question.id),
    });
  };

  const reset = (): void => {
    setAnswers({});
    setIsSubmitted(false);
  };

  return (
    <section id={QUIZ_ANCHOR} aria-label="Quiz" className="not-prose my-8 scroll-mt-24 rounded-xl border bg-card p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <HelpCircle className="size-5 text-primary" />
          {quiz.title}
        </h2>
        {isSubmitted ? (
          <p className="text-sm font-medium tabular-nums" role="status">
            Score: {score}/{quiz.questions.length}
          </p>
        ) : (
          previous && (
            <p className="text-xs text-muted-foreground tabular-nums">
              Best {previous.bestScore}/{previous.total} · {previous.attempts} attempt{previous.attempts === 1 ? '' : 's'}
            </p>
          )
        )}
      </header>

      <ol className="flex flex-col gap-6">
        {quiz.questions.map((question, index) => (
          <QuizQuestionItem
            key={question.id}
            number={index + 1}
            question={question}
            selected={answers[question.id] ?? []}
            isSubmitted={isSubmitted}
            onSelect={(optionId, isChecked) => select(question, optionId, isChecked)}
          />
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {isSubmitted ? (
          <Button variant="outline" onClick={reset}>
            <RotateCcw />
            Try again
          </Button>
        ) : (
          <Button onClick={submit} disabled={answeredCount === 0}>
            Check answers
          </Button>
        )}
        {!isSubmitted && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {answeredCount}/{quiz.questions.length} answered
          </span>
        )}
      </div>
    </section>
  );
}

interface QuizQuestionItemProps {
  number: number;
  question: QuizQuestion;
  selected: string[];
  isSubmitted: boolean;
  onSelect: (optionId: string, isChecked: boolean) => void;
}

function QuizQuestionItem({ number, question, selected, isSubmitted, onSelect }: QuizQuestionItemProps) {
  const isMultiple = question.correctOptionIds.length > 1;
  const isAnswerCorrect = isCorrect(question, selected);

  return (
    <li>
      <fieldset>
        <legend className="mb-3 text-sm font-medium leading-relaxed">
          {number}. <QuizText text={question.prompt} />
          {isMultiple && <span className="ml-1 text-xs text-muted-foreground">(select all that apply)</span>}
        </legend>
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isSelected = selected.includes(option.id);
            const isRightOption = question.correctOptionIds.includes(option.id);
            return (
              <label
                key={option.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                  !isSubmitted && 'hover:bg-accent',
                  !isSubmitted && isSelected && 'border-primary bg-primary/5',
                  isSubmitted && isRightOption && 'border-success bg-success/10',
                  isSubmitted && isSelected && !isRightOption && 'border-destructive bg-destructive/10',
                  isSubmitted && 'cursor-default',
                )}
              >
                <input
                  type={isMultiple ? 'checkbox' : 'radio'}
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  disabled={isSubmitted}
                  onChange={(event) => onSelect(option.id, event.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span>
                  <QuizText text={option.text} />
                  {isSubmitted && option.explanation && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      <QuizText text={option.explanation} />
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        {isSubmitted && (
          <p className={cn('mt-3 flex items-start gap-2 text-sm', isAnswerCorrect ? 'text-success' : 'text-destructive')}>
            {isAnswerCorrect ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
            <span>
              {isAnswerCorrect ? 'Correct.' : 'Not quite.'}
              {question.explanation && (
                <span className="text-muted-foreground">
                  {' '}
                  <QuizText text={question.explanation} />
                </span>
              )}
            </span>
          </p>
        )}
      </fieldset>
    </li>
  );
}
