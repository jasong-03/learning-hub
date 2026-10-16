import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  KUBERNETES_V1_MIGRATION,
  createEmptyProgress,
  migrateKubernetesV1,
  parseProgress,
  reconcileProgress,
  resetProgressState,
  v1ChecklistIdToV2,
  withCompletion,
  withQuestionResult,
  type KnownIds,
  type ProgressState,
} from '../src/lib/progress/model';

const known: KnownIds = {
  items: new Set(['kubernetes:note-01', 'kubernetes:note-03', 'kubernetes:lab-06', 'aws:iam-basics']),
  checklistItems: new Set(['kubernetes:lab-06#1-create-the-deployment', 'kubernetes:lab-06#cleanup']),
  quizzes: new Set(['kubernetes:quiz-note-03']),
  questions: new Set(['ai-engineer-interview:rag-q1']),
};

const v1 = JSON.stringify({
  version: 1,
  completed: { 'note-01': '2026-10-01T10:00:00.000Z', 'note-03': '2026-10-02T10:00:00.000Z', 'removed-lesson': '2026-10-03T10:00:00.000Z' },
  checklist: { 'lab-06:1-create-the-deployment': true, 'lab-06:cleanup': true, 'lab-99:gone': true },
  lastVisited: { lessonId: 'lab-06', at: '2026-10-04T10:00:00.000Z' },
});

function migrateAndReconcile(state: ProgressState, raw: string | null): ProgressState {
  return reconcileProgress(migrateKubernetesV1(state, raw).state, known).state;
}

describe('v1 -> v2 progress migration', () => {
  it('prefixes v1 ids with the kubernetes course and keeps timestamps', () => {
    const state = migrateAndReconcile(createEmptyProgress(), v1);
    assert.deepEqual(state.completed['kubernetes:note-01'], { completedAt: '2026-10-01T10:00:00.000Z' });
    assert.deepEqual(state.completed['kubernetes:note-03'], { completedAt: '2026-10-02T10:00:00.000Z' });
    assert.equal(state.checklist['kubernetes:lab-06#1-create-the-deployment'], true);
    assert.equal(state.checklist['kubernetes:lab-06#cleanup'], true);
    assert.deepEqual(state.lastVisited.kubernetes, { itemId: 'kubernetes:lab-06', at: '2026-10-04T10:00:00.000Z' });
    assert.deepEqual(state.appliedMigrations, [KUBERNETES_V1_MIGRATION]);
  });

  it('maps checklist ids at the first colon only', () => {
    assert.equal(v1ChecklistIdToV2('lab-06:step-1:odd'), 'kubernetes:lab-06#step-1:odd');
    assert.equal(v1ChecklistIdToV2('no-separator'), null);
    assert.equal(v1ChecklistIdToV2(':anchor'), null);
  });

  it('keeps unknown ids as orphans instead of dropping them', () => {
    const state = migrateAndReconcile(createEmptyProgress(), v1);
    assert.equal(state.completed['kubernetes:removed-lesson'], undefined);
    assert.deepEqual(state.orphans.completed['kubernetes:removed-lesson'], { completedAt: '2026-10-03T10:00:00.000Z' });
    assert.equal(state.orphans.checklist['kubernetes:lab-99#gone'], true);
  });

  it('is idempotent', () => {
    const once = migrateAndReconcile(createEmptyProgress(), v1);
    const twice = migrateAndReconcile(once, v1);
    assert.deepEqual(twice, once);
    assert.equal(migrateKubernetesV1(once, v1).changed, false);
    assert.equal(reconcileProgress(once, known).changed, false);
  });

  it('never overwrites newer v2 progress', () => {
    const existing = withCompletion(createEmptyProgress(), 'kubernetes:note-03', true, new Date('2026-10-10T00:00:00.000Z'));
    existing.lastVisited.kubernetes = { itemId: 'kubernetes:note-01', at: '2026-10-11T00:00:00.000Z' };
    const state = migrateAndReconcile(existing, v1);
    assert.equal(state.completed['kubernetes:note-03'].completedAt, '2026-10-10T00:00:00.000Z');
    assert.equal(state.lastVisited.kubernetes.itemId, 'kubernetes:note-01');
    assert.ok(state.completed['kubernetes:note-01'], 'missing v1 entries are still added');
  });

  it('does not re-import v1 after a reset', () => {
    const migrated = migrateAndReconcile(createEmptyProgress(), v1);
    const reset = resetProgressState(migrated);
    assert.deepEqual(reset.completed, {});
    const afterReload = migrateAndReconcile(reset, v1);
    assert.deepEqual(afterReload.completed, {});
  });

  it('leaves state untouched and unmarked when v1 data is corrupt or missing', () => {
    for (const raw of ['{not json', JSON.stringify({ version: 1, completed: 'x' }), null]) {
      const result = migrateKubernetesV1(createEmptyProgress(), raw);
      assert.equal(result.changed, false);
      assert.deepEqual(result.state.appliedMigrations, []);
      assert.ok(result.skippedReason);
    }
  });

  it('restores orphans when the id comes back or is aliased', () => {
    const migrated = migrateAndReconcile(createEmptyProgress(), v1);
    const withLessonBack: KnownIds = { ...known, items: new Set([...known.items, 'kubernetes:removed-lesson']) };
    const restored = reconcileProgress(migrated, withLessonBack).state;
    assert.ok(restored.completed['kubernetes:removed-lesson']);
    assert.equal(restored.orphans.completed['kubernetes:removed-lesson'], undefined);

    const aliases = { 'kubernetes:lab-99': 'kubernetes:lab-06' };
    const withAlias: KnownIds = { ...known, checklistItems: new Set([...known.checklistItems, 'kubernetes:lab-06#gone']) };
    const aliased = reconcileProgress(migrated, withAlias, aliases).state;
    assert.equal(aliased.checklist['kubernetes:lab-06#gone'], true);
    assert.equal(aliased.orphans.checklist['kubernetes:lab-99#gone'], undefined);
  });

  it('prefers the existing entry when an orphan resolves to an id that already has progress', () => {
    const state = createEmptyProgress();
    state.completed['kubernetes:note-01'] = { completedAt: 'new' };
    state.orphans.completed['kubernetes:old-note-01'] = { completedAt: 'old' };
    const result = reconcileProgress(state, known, { 'kubernetes:old-note-01': 'kubernetes:note-01' }).state;
    assert.equal(result.completed['kubernetes:note-01'].completedAt, 'new');
    assert.deepEqual(result.orphans.completed, {});
  });

  it('reads v2 saves written before question results existed', () => {
    const legacyV2 = migrateAndReconcile(createEmptyProgress(), v1) as Partial<ProgressState>;
    delete legacyV2.questions;
    delete (legacyV2.orphans as Partial<ProgressState['orphans']>).questions;
    const { state, problem } = parseProgress(JSON.stringify(legacyV2));
    assert.equal(problem, undefined);
    assert.deepEqual(state.questions, {});
    assert.deepEqual(state.orphans.questions, {});
    assert.ok(state.completed['kubernetes:note-01'], 'existing Kubernetes progress survives');
  });

  it('keeps question results for removed questions as orphans', () => {
    const state = withQuestionResult(createEmptyProgress(), 'ai-engineer-interview:rag-q99', 'incorrect', new Date('2026-10-16T00:00:00Z'));
    const reconciled = reconcileProgress(state, known).state;
    assert.equal(reconciled.questions['ai-engineer-interview:rag-q99'], undefined);
    assert.equal(reconciled.orphans.questions['ai-engineer-interview:rag-q99'].result, 'incorrect');
  });

  it('parses stored v2 state and rejects malformed values without throwing', () => {
    const state = migrateAndReconcile(createEmptyProgress(), v1);
    assert.deepEqual(parseProgress(JSON.stringify(state)).state, state);
    assert.ok(parseProgress('{oops').problem);
    assert.ok(parseProgress(JSON.stringify({ version: 3 })).problem);
    assert.deepEqual(parseProgress(null).state, createEmptyProgress());
  });
});
