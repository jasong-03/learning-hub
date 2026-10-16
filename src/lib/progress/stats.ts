import type { Lab, LearningItem, Quiz } from '@/domain/types';
import type { ProgressState, QuestionOutcome } from './model';

export interface CompletionStats {
  done: number;
  total: number;
  percent: number;
}

function toStats(done: number, total: number): CompletionStats {
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function completionOf(items: { id: string }[], state: ProgressState): CompletionStats {
  return toStats(items.filter((item) => state.completed[item.id]).length, items.length);
}

export function checklistCompletionOf(lab: Pick<Lab, 'checklist'>, state: ProgressState): CompletionStats {
  return toStats(lab.checklist.filter((item) => state.checklist[item.id]).length, lab.checklist.length);
}

export type ItemStatus = 'complete' | 'in-progress' | 'not-started';

export function itemStatus(item: LearningItem, state: ProgressState): ItemStatus {
  if (state.completed[item.id]) return 'complete';
  if (item.kind === 'lab' && checklistCompletionOf(item, state).done > 0) return 'in-progress';
  return 'not-started';
}

/**
 * Where "continue" points within an ordered item list: the last visited item if
 * it is unfinished, else the first unfinished item after it, else the first unfinished overall.
 */
export function nextItem(ordered: LearningItem[], state: ProgressState, lastVisitedId?: string): LearningItem | undefined {
  const lastIndex = ordered.findIndex((item) => item.id === lastVisitedId);
  if (lastIndex !== -1 && !state.completed[ordered[lastIndex].id]) return ordered[lastIndex];
  return ordered.slice(lastIndex + 1).find((item) => !state.completed[item.id]) ?? ordered.find((item) => !state.completed[item.id]);
}

/** Courses the learner has opened, most recent first. */
export function recentCourseIds(state: ProgressState): string[] {
  return Object.entries(state.lastVisited)
    .sort(([, a], [, b]) => b.at.localeCompare(a.at))
    .map(([courseId]) => courseId);
}

export function quizzesToRetake(quizzes: Quiz[], state: ProgressState): Quiz[] {
  return quizzes.filter((quiz) => {
    const result = state.quizzes[quiz.id];
    return result !== undefined && result.lastScore < result.total;
  });
}

export function labsInProgress(labs: Lab[], state: ProgressState): Lab[] {
  return labs.filter((lab) => !state.completed[lab.id] && checklistCompletionOf(lab, state).done > 0);
}

/** Completed items ordered by completion time, oldest first: candidates for revisiting. */
export function oldestCompleted<T extends { id: string }>(items: T[], state: ProgressState): (T & { completedAt: string })[] {
  return items
    .flatMap((item) => {
      const completion = state.completed[item.id];
      return completion ? [{ ...item, completedAt: completion.completedAt }] : [];
    })
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

const DAY_MS = 86_400_000;

/** Completions, quiz attempts and practiced questions per week for the last `weeks` weeks (oldest first), weeks start on Monday (UTC). */
export function weeklyActivity(state: ProgressState, weeks: number, now: Date): { weekStart: string; count: number }[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceMonday = (new Date(today).getUTCDay() + 6) % 7;
  const currentWeekStart = today - daysSinceMonday * DAY_MS;
  const buckets = Array.from({ length: weeks }, (_, index) => ({
    start: currentWeekStart - (weeks - 1 - index) * 7 * DAY_MS,
    count: 0,
  }));
  const timestamps = [
    ...Object.values(state.completed).map((entry) => entry.completedAt),
    ...Object.values(state.quizzes).map((entry) => entry.lastAttemptAt),
    ...Object.values(state.questions).map((entry) => entry.lastAt),
  ];
  for (const timestamp of timestamps) {
    const time = Date.parse(timestamp);
    if (Number.isNaN(time)) continue;
    const bucket = buckets.find((candidate) => time >= candidate.start && time < candidate.start + 7 * DAY_MS);
    if (bucket) bucket.count += 1;
  }
  return buckets.map((bucket) => ({ weekStart: new Date(bucket.start).toISOString().slice(0, 10), count: bucket.count }));
}

export interface QuestionStats {
  total: number;
  practiced: number;
  /** Answered correctly, or self-assessed as known. */
  solid: number;
  /** Answered incorrectly, or marked for review. */
  needsReview: number;
}

const SOLID: QuestionOutcome[] = ['correct', 'knew'];

export function questionStats(questionIds: string[], state: ProgressState): QuestionStats {
  let practiced = 0;
  let solid = 0;
  for (const id of questionIds) {
    const entry = state.questions[id];
    if (!entry) continue;
    practiced += 1;
    if (SOLID.includes(entry.result)) solid += 1;
  }
  return { total: questionIds.length, practiced, solid, needsReview: practiced - solid };
}

export function needsReview(questionId: string, state: ProgressState): boolean {
  const entry = state.questions[questionId];
  return entry !== undefined && !SOLID.includes(entry.result);
}
