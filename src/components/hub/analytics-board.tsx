'use client';

import { Progress } from '@/components/ui/progress';
import { catalog } from '@/lib/catalog';
import { completionOf, questionStats, weeklyActivity } from '@/lib/progress/stats';
import { useProgress } from '@/lib/progress/store';

const WEEKS = 12;

/** Completion by course and category, weekly activity and quiz performance, all from local progress. */
export function AnalyticsBoard() {
  const progress = useProgress();
  const allItems = catalog.data.courses.flatMap((course) => catalog.courseItems(course.id));
  const overall = completionOf(allItems, progress);
  const activity = weeklyActivity(progress, WEEKS, new Date());
  const maxWeek = Math.max(1, ...activity.map((week) => week.count));
  const questions = questionStats(catalog.data.questionSets.flatMap((set) => set.questionIds), progress);
  const quizResults = catalog.data.quizzes.flatMap((quiz) => progress.quizzes[quiz.id] ?? []);
  const averageBest = quizResults.length === 0
    ? null
    : Math.round((quizResults.reduce((sum, result) => sum + result.bestScore / result.total, 0) / quizResults.length) * 100);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Overall completion" value={`${overall.percent}%`} detail={`${overall.done}/${overall.total} lessons and labs`} />
        <Metric label="Completed this week" value={String(activity[activity.length - 1]?.count ?? 0)} detail="Lessons, labs and quiz attempts" />
        <Metric
          label="Question accuracy"
          value={questions.practiced === 0 ? '–' : `${Math.round((questions.solid / questions.practiced) * 100)}%`}
          detail={`${questions.practiced}/${questions.total} questions practiced`}
        />
        <Metric label="Average best quiz score" value={averageBest === null ? '–' : `${averageBest}%`} detail={`${quizResults.length}/${catalog.data.quizzes.length} quizzes attempted`} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Weekly activity</h2>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label={`Activity for the last ${WEEKS} weeks`}>
            {activity.map((week) => (
              <div key={week.weekStart} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-muted-foreground tabular-nums">{week.count > 0 ? week.count : ''}</span>
                <div
                  className="w-full rounded-t bg-primary/80"
                  style={{ height: `${(week.count / maxWeek) * 100}%`, minHeight: week.count > 0 ? 4 : 1 }}
                  title={`Week of ${week.weekStart}: ${week.count}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{activity[0]?.weekStart}</span>
            <span>This week</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Breakdown
          title="By course"
          rows={catalog.data.courses.map((course) => ({ id: course.id, label: course.title, stats: completionOf(catalog.courseItems(course.id), progress) }))}
        />
        <Breakdown
          title="By category"
          rows={catalog.data.categories.map((category) => ({
            id: category.id,
            label: category.title,
            stats: completionOf(
              catalog.data.courses.filter((course) => course.categoryId === category.id).flatMap((course) => catalog.courseItems(course.id)),
              progress,
            ),
          }))}
        />
      </section>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { id: string; label: string; stats: { done: number; total: number; percent: number } }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {row.stats.total === 0 ? 'No content yet' : `${row.stats.done}/${row.stats.total} · ${row.stats.percent}%`}
              </span>
            </div>
            <Progress value={row.stats.percent} aria-label={`${row.label} completion`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
