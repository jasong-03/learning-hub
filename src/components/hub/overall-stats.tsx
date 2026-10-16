'use client';

import type { ReactNode } from 'react';
import { BookOpen, FlaskConical, HelpCircle, ListChecks, MessagesSquare } from 'lucide-react';
import { catalog } from '@/lib/catalog';
import { completionOf, questionStats } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

export function OverallStats() {
  const progress = useProgress();
  const steps = catalog.data.labs.flatMap((lab) => lab.checklist);
  const attempted = catalog.data.quizzes.filter((quiz) => progress.quizzes[quiz.id]);
  const questions = questionStats(catalog.data.questionSets.flatMap((set) => set.questionIds), progress);
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Stat icon={<BookOpen className="size-4" />} label="Lessons" value={format(completionOf(catalog.data.lessons, progress))} />
      <Stat icon={<FlaskConical className="size-4" />} label="Labs" value={format(completionOf(catalog.data.labs, progress))} />
      <Stat icon={<ListChecks className="size-4" />} label="Lab steps" value={`${steps.filter((item) => progress.checklist[item.id]).length}/${steps.length}`} />
      <Stat icon={<HelpCircle className="size-4" />} label="Quizzes" value={`${attempted.length}/${catalog.data.quizzes.length}`} />
      <Stat icon={<MessagesSquare className="size-4" />} label="Questions" value={`${questions.practiced}/${questions.total}`} />
    </section>
  );
}

function format(stats: { done: number; total: number }): string {
  return `${stats.done}/${stats.total}`;
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
