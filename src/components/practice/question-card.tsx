'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, Eye, RotateCcw, ThumbsUp, XCircle } from 'lucide-react';
import type { Question } from '@/domain/types';
import { HtmlContent } from '@/components/practice/html-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { recordQuestionResult, useProgress } from '@/lib/progress/store';
import { isAnswerCorrect } from '@/lib/quiz-grading';
import { cn } from '@/lib/utils';

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;
const RESULT_LABELS = { correct: 'Answered correctly', incorrect: 'Answered incorrectly', knew: 'Marked as known', review: 'Marked for review' } as const;

export function QuestionMeta({ question }: { question: Question }) {
  const result = useProgress().questions[question.id];
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <Badge variant="secondary">{question.topic}</Badge>
      {question.difficulty && <Badge variant="outline">{DIFFICULTY_LABELS[question.difficulty]}</Badge>}
      <Badge variant="outline">{question.format === 'multiple-choice' ? 'Multiple choice' : 'Open-ended'}</Badge>
      {question.provenance && <Badge variant="outline">{question.provenance.kind === 'reported' ? 'Reported' : 'Representative'}</Badge>}
      {result && (
        <span className={cn('ms-1', result.result === 'correct' || result.result === 'knew' ? 'text-success' : 'text-destructive')}>
          {RESULT_LABELS[result.result]}
        </span>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  /** Start expanded (practice/review) instead of showing only the prompt (browse). */
  isInitiallyOpen?: boolean;
  onAnswered?: (questionId: string) => void;
}

/** One question-bank entry: graded multiple choice, or reveal-and-self-assess for open-ended questions. */
export function QuestionCard({ question, isInitiallyOpen = false, onAnswered }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  return (
    <article className="rounded-xl border bg-card p-4 sm:p-5">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} className="flex w-full items-start gap-3 text-start">
        <span className="mt-0.5 shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary tabular-nums">{question.label}</span>
        <span className="min-w-0 flex-1 text-sm font-medium leading-relaxed">
          <HtmlContent html={question.promptHtml} inline />
        </span>
        <ChevronDown className={cn('mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} aria-hidden />
      </button>
      <div className="mt-3 ps-0 sm:ps-10">
        <QuestionMeta question={question} />
      </div>
      {isOpen && (
        <div className="mt-4 sm:ps-10">
          {question.format === 'multiple-choice' ? (
            <MultipleChoice question={question} onAnswered={onAnswered} />
          ) : (
            <OpenEnded question={question} onAnswered={onAnswered} />
          )}
          <Footer question={question} />
        </div>
      )}
    </article>
  );
}

function MultipleChoice({ question, onAnswered }: Pick<QuestionCardProps, 'question' | 'onAnswered'>) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const options = question.options ?? [];
  const correctIds = options.filter((option) => option.isCorrect).map((option) => option.id);
  const isMultiple = correctIds.length > 1;
  const isCorrect = isAnswerCorrect(correctIds, selected);

  const toggle = (optionId: string, isChecked: boolean): void => {
    if (isSubmitted) return;
    setSelected((current) => (isMultiple ? (isChecked ? [...current, optionId] : current.filter((id) => id !== optionId)) : [optionId]));
  };
  const submit = (): void => {
    setIsSubmitted(true);
    recordQuestionResult(question.id, isCorrect ? 'correct' : 'incorrect');
    onAnswered?.(question.id);
  };

  return (
    <fieldset>
      <legend className="sr-only">Options{isMultiple ? ' (select all that apply)' : ''}</legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                !isSubmitted && 'hover:bg-accent',
                !isSubmitted && isSelected && 'border-primary bg-primary/5',
                isSubmitted && option.isCorrect && 'border-success bg-success/10',
                isSubmitted && isSelected && !option.isCorrect && 'border-destructive bg-destructive/10',
                isSubmitted && 'cursor-default',
              )}
            >
              <input
                type={isMultiple ? 'checkbox' : 'radio'}
                name={question.id}
                checked={isSelected}
                disabled={isSubmitted}
                onChange={(event) => toggle(option.id, event.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="min-w-0">
                <HtmlContent html={option.html} inline />
                {isSubmitted && option.explanationHtml && (
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                    <HtmlContent html={option.explanationHtml} inline />
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {isSubmitted && question.answerHtml && <HtmlContent html={question.answerHtml} className="mt-3 rounded-lg bg-muted/40 p-3" />}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {isSubmitted ? (
          <>
            <p className={cn('flex items-center gap-1.5 text-sm font-medium', isCorrect ? 'text-success' : 'text-destructive')} role="status">
              {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {isCorrect ? 'Correct' : 'Not quite'}
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSelected([]); setIsSubmitted(false); }}>
              <RotateCcw />
              Try again
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={submit} disabled={selected.length === 0}>
            Check answer
          </Button>
        )}
      </div>
    </fieldset>
  );
}

function OpenEnded({ question, onAnswered }: Pick<QuestionCardProps, 'question' | 'onAnswered'>) {
  const [isRevealed, setIsRevealed] = useState(false);
  const assess = (result: 'knew' | 'review'): void => {
    recordQuestionResult(question.id, result);
    onAnswered?.(question.id);
  };
  if (!isRevealed) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Answer out loud or in writing first, then compare with the reference answer.</p>
        <Button size="sm" className="w-fit" onClick={() => setIsRevealed(true)}>
          <Eye />
          Reveal answer
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {question.answerHtml && <HtmlContent html={question.answerHtml} className="rounded-lg bg-muted/40 p-3" />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">How did you do?</span>
        <Button size="sm" variant="outline" onClick={() => assess('knew')}>
          <ThumbsUp />
          I knew it
        </Button>
        <Button size="sm" variant="outline" onClick={() => assess('review')}>
          <RotateCcw />
          Review again
        </Button>
      </div>
    </div>
  );
}

function Footer({ question }: { question: Question }) {
  const sources = question.provenance?.sources ?? [];
  return (
    <div className="mt-4 flex flex-col gap-2 border-t pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0">
        {question.section && <span className="block">{question.section}</span>}
        {sources.length > 0 && (
          <span className="block">
            Sources:{' '}
            {sources.map((source, index) => (
              <span key={`${source.url}-${index}`}>
                {index > 0 && ', '}
                <a href={source.url} className="underline hover:text-foreground" target={source.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {source.label}
                </a>
              </span>
            ))}
          </span>
        )}
      </span>
      <Link href={question.contextUrl} className="flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
        <BookOpen className="size-3.5" />
        View in lesson
      </Link>
    </div>
  );
}
