import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Catalog } from '../src/domain/types';
import { createCatalogIndex } from '../src/lib/catalog-index';
import { createEmptyProgress, withChecklistItem, withCompletion, withQuestionResult, withQuizAttempt, withVisit } from '../src/lib/progress/model';
import { checklistCompletionOf, completionOf, itemStatus, labsInProgress, nextItem, quizzesToRetake, recentCourseIds, weeklyActivity } from '../src/lib/progress/stats';

const lesson = (courseId: string, localId: string, moduleLocalId: string, order: number) => ({
  id: `${courseId}:${localId}`,
  localId,
  courseId,
  moduleId: `${courseId}:${moduleLocalId}`,
  title: localId,
  url: `/courses/${courseId}/learn/${moduleLocalId}/${localId}`,
  order,
  relatedLabIds: [],
});

// Two courses deliberately reuse the same local ids to prove isolation.
const fixture: Catalog = {
  categories: [{ id: 'cat', title: 'Cat', description: 'd' }],
  courses: ['alpha', 'beta'].map((id) => ({
    id,
    title: id,
    description: 'd',
    categoryId: 'cat',
    level: 'beginner' as const,
    language: 'en',
    status: 'active' as const,
    icon: 'Box',
    tags: [],
    url: `/courses/${id}`,
    moduleIds: [`${id}:m1`, `${id}:m2`],
  })),
  modules: ['alpha', 'beta'].flatMap((courseId) => [
    { id: `${courseId}:m1`, localId: 'm1', courseId, title: 'M1', description: 'd', lessonIds: [`${courseId}:intro`], labIds: [`${courseId}:lab-01`] },
    { id: `${courseId}:m2`, localId: 'm2', courseId, title: 'M2', description: 'd', lessonIds: [`${courseId}:advanced`], labIds: [] },
  ]),
  lessons: ['alpha', 'beta'].flatMap((courseId) => [lesson(courseId, 'intro', 'm1', 0), lesson(courseId, 'advanced', 'm2', 0)]),
  labs: ['alpha', 'beta'].map((courseId) => ({
    id: `${courseId}:lab-01`,
    localId: 'lab-01',
    courseId,
    moduleId: `${courseId}:m1`,
    title: 'Lab 1',
    url: `/courses/${courseId}/labs/lab-01`,
    order: 1,
    checklist: [
      { id: `${courseId}:lab-01#step-1`, label: 'Step 1', anchor: 'step-1' },
      { id: `${courseId}:lab-01#step-2`, label: 'Step 2', anchor: 'step-2' },
    ],
    relatedLessonIds: [],
  })),
  quizzes: [
    { id: 'alpha:quiz-intro', courseId: 'alpha', lessonId: 'alpha:intro', title: 'Q', questions: [] },
    { id: 'beta:quiz-intro', courseId: 'beta', lessonId: 'beta:intro', title: 'Q', questions: [] },
  ],
  questionSets: ['alpha', 'beta'].map((courseId) => ({
    id: `${courseId}:qset-intro`,
    courseId,
    topic: 'Intro',
    lessonId: `${courseId}:advanced`,
    relatedLessonIds: [`${courseId}:intro`],
    questionIds: [`${courseId}:intro-q1`, `${courseId}:intro-q2`],
    counts: { total: 2, multipleChoice: 1, openEnded: 1 },
  })),
  paths: [
    { id: 'mixed', title: 'Mixed', description: 'd', url: '/paths/mixed', items: [
      { type: 'module', courseId: 'alpha', moduleId: 'm1' },
      { type: 'course', courseId: 'alpha' },
      { type: 'module', courseId: 'beta', moduleId: 'm2' },
    ] },
  ],
};
const index = createCatalogIndex(fixture);
const now = new Date('2026-10-16T12:00:00.000Z');

describe('progress isolation across courses', () => {
  it('completing an item in one course does not affect another course with the same local ids', () => {
    let state = withCompletion(createEmptyProgress(), 'alpha:intro', true, now);
    state = withChecklistItem(state, 'alpha:lab-01#step-1', true);
    assert.deepEqual(completionOf(index.courseItems('alpha'), state), { done: 1, total: 3, percent: 33 });
    assert.deepEqual(completionOf(index.courseItems('beta'), state), { done: 0, total: 3, percent: 0 });
    assert.equal(checklistCompletionOf(index.getLab('beta:lab-01')!, state).done, 0);
    assert.equal(itemStatus(index.getItem('alpha:lab-01')!, state), 'in-progress');
    assert.equal(itemStatus(index.getItem('beta:lab-01')!, state), 'not-started');
  });

  it('keeps last visited per course and orders recent courses', () => {
    let state = withVisit(createEmptyProgress(), 'alpha', 'alpha:intro', new Date('2026-10-01T00:00:00Z'));
    state = withVisit(state, 'beta', 'beta:lab-01', new Date('2026-10-02T00:00:00Z'));
    assert.deepEqual(recentCourseIds(state), ['beta', 'alpha']);
    assert.equal(state.lastVisited.alpha.itemId, 'alpha:intro');
  });

  it('quiz results are tracked per quiz id', () => {
    const state = withQuizAttempt(createEmptyProgress(), 'alpha:quiz-intro', { score: 1, total: 3, incorrectQuestionIds: ['a', 'b'] }, now);
    assert.deepEqual(quizzesToRetake(fixture.quizzes, state).map((quiz) => quiz.id), ['alpha:quiz-intro']);
    const improved = withQuizAttempt(state, 'alpha:quiz-intro', { score: 3, total: 3, incorrectQuestionIds: [] }, now);
    assert.equal(improved.quizzes['alpha:quiz-intro'].attempts, 2);
    assert.equal(improved.quizzes['alpha:quiz-intro'].bestScore, 3);
    assert.deepEqual(quizzesToRetake(fixture.quizzes, improved), []);
  });
});

describe('question practice isolation', () => {
  it('keeps question results per course and finds sets for a lesson', () => {
    const state = withQuestionResult(createEmptyProgress(), 'alpha:intro-q1', 'correct', now);
    assert.equal(state.questions['alpha:intro-q1'].result, 'correct');
    assert.equal(state.questions['beta:intro-q1'], undefined);
    assert.deepEqual(index.lessonQuestionSets('alpha:intro').map((set) => set.id), ['alpha:qset-intro']);
    assert.deepEqual(index.courseQuestionSets('beta').map((set) => set.id), ['beta:qset-intro']);
    assert.ok(index.knownIds.questions.has('beta:intro-q2'));
    const again = withQuestionResult(state, 'alpha:intro-q1', 'incorrect', now);
    assert.equal(again.questions['alpha:intro-q1'].attempts, 2);
  });
});

describe('learning path progress', () => {
  it('de-duplicates overlapping course and module items, in path order', () => {
    const ids = index.pathItems('mixed').map((item) => item.id);
    assert.deepEqual(ids, ['alpha:intro', 'alpha:lab-01', 'alpha:advanced', 'beta:advanced']);
  });

  it('aggregates completion across courses', () => {
    let state = withCompletion(createEmptyProgress(), 'alpha:intro', true, now);
    state = withCompletion(state, 'beta:advanced', true, now);
    state = withCompletion(state, 'beta:intro', true, now); // not part of the path
    assert.deepEqual(completionOf(index.pathItems('mixed'), state), { done: 2, total: 4, percent: 50 });
  });
});

describe('next item and review helpers', () => {
  it('continues from the last visited unfinished item', () => {
    const items = index.courseItems('alpha');
    let state = createEmptyProgress();
    assert.equal(nextItem(items, state)?.id, 'alpha:intro');
    state = withCompletion(state, 'alpha:intro', true, now);
    assert.equal(nextItem(items, state, 'alpha:intro')?.id, 'alpha:lab-01');
    assert.equal(nextItem(items, state, 'alpha:advanced')?.id, 'alpha:advanced');
  });

  it('lists labs with checked steps that are not complete', () => {
    const state = withChecklistItem(createEmptyProgress(), 'beta:lab-01#step-2', true);
    assert.deepEqual(labsInProgress(fixture.labs, state).map((lab) => lab.id), ['beta:lab-01']);
  });

  it('buckets activity by week', () => {
    let state = withCompletion(createEmptyProgress(), 'alpha:intro', true, new Date('2026-10-14T00:00:00Z'));
    state = withCompletion(state, 'alpha:advanced', true, new Date('2026-10-05T00:00:00Z'));
    const weeks = weeklyActivity(state, 3, now);
    assert.deepEqual(weeks.map((week) => week.count), [0, 1, 1]);
    assert.equal(weeks[2].weekStart, '2026-10-12');
  });
});
