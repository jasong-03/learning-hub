'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Play, Shuffle } from 'lucide-react';
import type { Question } from '@/domain/types';
import { FilterGroup } from '@/components/hub/course-catalog';
import { QuestionCard } from '@/components/practice/question-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { needsReview, questionStats } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';
import { cn } from '@/lib/utils';

const MODES = [
  { value: 'browse', label: 'Browse' },
  { value: 'practice', label: 'Practice' },
  { value: 'review', label: 'Review answers' },
] as const;
type Mode = (typeof MODES)[number]['value'];

const ALL = 'all';

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, '').toLowerCase();
}
const PAGE_SIZE = 25;

interface QuestionBankViewProps {
  questions: Question[];
  sets: { id: string; topic: string }[];
}

/**
 * Question-bank workspace for one course. Filters and mode live in the URL
 * (?mode=practice&set=<setId>&difficulty=hard) so "practice by topic/difficulty"
 * links from other pages open the right view.
 */
export function QuestionBankView({ questions, sets }: QuestionBankViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const progress = useProgress();
  const mode = (MODES.find((option) => option.value === params.get('mode'))?.value ?? 'browse') as Mode;
  const filter = (name: string): string => params.get(name) ?? ALL;
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const setParam = (name: string, value: string): void => {
    const next = new URLSearchParams(params.toString());
    if (value === ALL || (name === 'mode' && value === 'browse')) next.delete(name);
    else next.set(name, value);
    setVisibleCount(PAGE_SIZE);
    router.replace(`${pathname}${next.size > 0 ? `?${next.toString()}` : ''}`, { scroll: false });
  };

  const text = query.trim().toLowerCase();
  const filtered = questions.filter((question) => {
      const result = progress.questions[question.id]?.result;
      const status = filter('status');
      return (
        (filter('set') === ALL || question.setId === filter('set')) &&
        (filter('difficulty') === ALL || question.difficulty === filter('difficulty')) &&
        (filter('format') === ALL || question.format === filter('format')) &&
        (filter('source') === ALL || question.provenance?.kind === filter('source')) &&
        (status === ALL || (status === 'new' ? result === undefined : status === 'review' ? needsReview(question.id, progress) : result === 'correct' || result === 'knew')) &&
        (text === '' || plainText(question.promptHtml).includes(text) || question.label.toLowerCase() === text)
      );
  });

  const reviewQueue = questions.filter((question) => needsReview(question.id, progress));
  const stats = questionStats(questions.map((question) => question.id), progress);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questions" value={stats.total} />
        <Stat label="Practiced" value={stats.practiced} />
        <Stat label="Correct / known" value={stats.solid} />
        <Stat label="To review" value={stats.needsReview} />
      </section>

      <div role="tablist" aria-label="Question bank mode" className="flex flex-wrap gap-1 rounded-lg border bg-card p-1 w-fit">
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={mode === option.value}
            onClick={() => setParam('mode', option.value)}
            className={cn('rounded-md px-3 py-1.5 text-sm transition-colors', mode === option.value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
          >
            {option.label}
            {option.value === 'review' && reviewQueue.length > 0 && <span className="ms-1.5 tabular-nums opacity-80">({reviewQueue.length})</span>}
          </button>
        ))}
      </div>

      {mode !== 'review' && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
          <FilterGroup label="Topic" value={filter('set')} onChange={(value) => setParam('set', value)} options={[{ value: ALL, label: 'All' }, ...sets.map((set) => ({ value: set.id, label: set.topic }))]} />
          <FilterGroup
            label="Difficulty"
            value={filter('difficulty')}
            onChange={(value) => setParam('difficulty', value)}
            options={[{ value: ALL, label: 'All' }, { value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]}
          />
          <FilterGroup
            label="Type"
            value={filter('format')}
            onChange={(value) => setParam('format', value)}
            options={[{ value: ALL, label: 'All' }, { value: 'multiple-choice', label: 'Multiple choice' }, { value: 'open-ended', label: 'Open-ended' }]}
          />
          <FilterGroup
            label="Source"
            value={filter('source')}
            onChange={(value) => setParam('source', value)}
            options={[{ value: ALL, label: 'All' }, { value: 'reported', label: 'Reported in interviews' }, { value: 'representative', label: 'Representative' }]}
          />
          <FilterGroup
            label="Status"
            value={filter('status')}
            onChange={(value) => setParam('status', value)}
            options={[{ value: ALL, label: 'All' }, { value: 'new', label: 'Not practiced' }, { value: 'review', label: 'To review' }, { value: 'solid', label: 'Correct / known' }]}
          />
          {mode === 'browse' && (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by text or label, e.g. KV cache or Q12"
              aria-label="Filter questions by text"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:max-w-sm"
            />
          )}
        </div>
      )}

      {mode === 'browse' && <BrowseList questions={filtered} visibleCount={visibleCount} onShowMore={() => setVisibleCount((count) => count + PAGE_SIZE)} />}
      {mode === 'practice' && <PracticeSession key={params.toString()} questions={filtered} />}
      {mode === 'review' && <ReviewList questions={reviewQueue} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function BrowseList({ questions, visibleCount, onShowMore }: { questions: Question[]; visibleCount: number; onShowMore: () => void }) {
  if (questions.length === 0) return <Empty>No questions match these filters.</Empty>;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        {questions.length} question{questions.length === 1 ? '' : 's'}. Select a question to answer it.
      </p>
      {questions.slice(0, visibleCount).map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
      {visibleCount < questions.length && (
        <Button variant="outline" className="w-fit self-center" onClick={onShowMore}>
          Show more ({questions.length - visibleCount} left)
        </Button>
      )}
    </div>
  );
}

/** One question at a time through the filtered set, optionally shuffled. */
function PracticeSession({ questions }: { questions: Question[] }) {
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [position, setPosition] = useState(0);
  const [answered, setAnswered] = useState<Set<string>>(new Set());

  if (questions.length === 0) return <Empty>No questions match these filters.</Empty>;
  if (!queue) {
    const start = (shuffle: boolean): void => {
      const order = [...questions];
      if (shuffle) {
        for (let index = order.length - 1; index > 0; index -= 1) {
          const swap = Math.floor(Math.random() * (index + 1));
          [order[index], order[swap]] = [order[swap], order[index]];
        }
      }
      setQueue(order);
      setPosition(0);
      setAnswered(new Set());
    };
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-5">
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{questions.length}</span> questions match. Multiple-choice questions are graded; for open-ended ones you reveal the answer and rate yourself.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => start(false)}>
            <Play />
            Start in order
          </Button>
          <Button variant="outline" onClick={() => start(true)}>
            <Shuffle />
            Shuffle
          </Button>
        </div>
      </div>
    );
  }

  const current = queue[position];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={(answered.size / queue.length) * 100} aria-label="Practice session progress" className="flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums">
          {position + 1}/{queue.length} · {answered.size} answered
        </span>
      </div>
      <QuestionCard key={current.id} question={current} isInitiallyOpen onAnswered={(id) => setAnswered((previous) => new Set(previous).add(id))} />
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" disabled={position === 0} onClick={() => setPosition((index) => index - 1)}>
          <ArrowLeft />
          Previous
        </Button>
        {position < queue.length - 1 ? (
          <Button onClick={() => setPosition((index) => index + 1)}>
            Next
            <ArrowRight />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setQueue(null)}>
            Finish session
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    return <Empty>Nothing to review. Questions you answer incorrectly or mark “Review again” appear here with their answers.</Empty>;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {questions.length} question{questions.length === 1 ? '' : 's'} answered incorrectly or marked for review. Answer again to update the result.
      </p>
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} isInitiallyOpen />
      ))}
    </div>
  );
}

function Empty({ children }: { children: string }) {
  return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
