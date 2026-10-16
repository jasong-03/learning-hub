import { z } from 'zod';

/**
 * Progress persistence model (pure: no window access, unit-tested).
 *
 * v1 (Kubernetes-only hub) stored unprefixed ids under LEGACY_V1_STORAGE_KEY.
 * v2 stores global ids (`<courseId>:<localId>`) under PROGRESS_STORAGE_KEY.
 * The v1 key is never modified or deleted; it stays as a backup.
 */

export const PROGRESS_STORAGE_KEY = 'learning-hub:progress:v2';
export const LEGACY_V1_STORAGE_KEY = 'k8s-learning-hub:progress';
export const KUBERNETES_V1_MIGRATION = 'kubernetes-v1';
const LEGACY_V1_COURSE_ID = 'kubernetes';

export const progressV1Schema = z.object({
  version: z.literal(1),
  completed: z.record(z.string(), z.string()),
  /** `<lessonId>:<anchor>` -> true */
  checklist: z.record(z.string(), z.literal(true)),
  lastVisited: z.object({ lessonId: z.string(), at: z.string() }).nullable(),
});

const completionSchema = z.object({ completedAt: z.string() });

export const quizResultSchema = z.object({
  attempts: z.number().int().nonnegative(),
  bestScore: z.number().int().nonnegative(),
  lastScore: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  lastAttemptAt: z.string(),
  incorrectQuestionIds: z.array(z.string()),
});

export const QUESTION_RESULTS = ['correct', 'incorrect', 'knew', 'review'] as const;

/**
 * Practice result per question. Multiple choice is graded (correct/incorrect);
 * open-ended questions are self-assessed after revealing the answer (knew/review).
 */
export const questionResultSchema = z.object({
  result: z.enum(QUESTION_RESULTS),
  attempts: z.number().int().positive(),
  lastAt: z.string(),
});

const progressEntriesSchema = z.object({
  /** lesson or lab global id -> completion */
  completed: z.record(z.string(), completionSchema),
  /** checklist item id (`<labId>#<anchor>`) -> checked */
  checklist: z.record(z.string(), z.literal(true)),
  /** quiz global id -> results */
  quizzes: z.record(z.string(), quizResultSchema),
  /** question global id -> latest practice result. Added after v2 shipped, so older saves default to {}. */
  questions: z.record(z.string(), questionResultSchema).default({}),
});

export const progressV2Schema = progressEntriesSchema.extend({
  version: z.literal(2),
  /** course id -> most recently opened lesson or lab */
  lastVisited: z.record(z.string(), z.object({ itemId: z.string(), at: z.string() })),
  /** Entries whose ids are not in the current catalog; restored automatically if the id (or an alias) returns. */
  orphans: progressEntriesSchema,
  appliedMigrations: z.array(z.string()),
});

export type ProgressV1 = z.infer<typeof progressV1Schema>;
export type ProgressState = z.infer<typeof progressV2Schema>;
export type QuizResult = z.infer<typeof quizResultSchema>;
export type QuestionResult = z.infer<typeof questionResultSchema>;
export type QuestionOutcome = (typeof QUESTION_RESULTS)[number];
type Entries = z.infer<typeof progressEntriesSchema>;
type EntryKind = keyof Entries;

export interface KnownIds {
  /** Lessons and labs. */
  items: ReadonlySet<string>;
  checklistItems: ReadonlySet<string>;
  quizzes: ReadonlySet<string>;
  questions: ReadonlySet<string>;
}

export function createEmptyProgress(): ProgressState {
  return {
    version: 2,
    completed: {},
    checklist: {},
    quizzes: {},
    questions: {},
    lastVisited: {},
    orphans: { completed: {}, checklist: {}, quizzes: {}, questions: {} },
    appliedMigrations: [],
  };
}

export function parseProgress(raw: string | null): { state: ProgressState; problem?: string } {
  if (raw === null) return { state: createEmptyProgress() };
  try {
    const result = progressV2Schema.safeParse(JSON.parse(raw));
    if (result.success) return { state: result.data };
    return { state: createEmptyProgress(), problem: `unexpected shape: ${result.error.issues[0]?.message ?? 'unknown'}` };
  } catch (error) {
    return { state: createEmptyProgress(), problem: `invalid JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
}

const v1GlobalId = (localId: string): string => `${LEGACY_V1_COURSE_ID}:${localId}`;

/** v1 checklist key `lab-06:step-1-x` -> v2 `kubernetes:lab-06#step-1-x`. */
export function v1ChecklistIdToV2(v1Id: string): string | null {
  const separator = v1Id.indexOf(':');
  if (separator <= 0 || separator === v1Id.length - 1) return null;
  return `${v1GlobalId(v1Id.slice(0, separator))}#${v1Id.slice(separator + 1)}`;
}

export interface MigrationResult {
  state: ProgressState;
  changed: boolean;
  /** Why the legacy data was not applied, if it was not. */
  skippedReason?: string;
}

/**
 * Merges v1 Kubernetes progress into v2. Never overwrites an existing v2 entry
 * (newer progress wins) and records a marker so it runs at most once.
 * Unknown ids are kept as orphans by `reconcileProgress`, not dropped.
 */
export function migrateKubernetesV1(state: ProgressState, v1Raw: string | null): MigrationResult {
  if (state.appliedMigrations.includes(KUBERNETES_V1_MIGRATION)) return { state, changed: false };
  if (v1Raw === null) return { state, changed: false, skippedReason: 'no v1 data' };

  let parsed: ProgressV1;
  try {
    const result = progressV1Schema.safeParse(JSON.parse(v1Raw));
    if (!result.success) return { state, changed: false, skippedReason: 'v1 data has an unexpected shape' };
    parsed = result.data;
  } catch {
    // Leave the marker unset so a repaired v1 value can still migrate later.
    return { state, changed: false, skippedReason: 'v1 data is not valid JSON' };
  }

  const next: ProgressState = structuredClone(state);
  for (const [localId, completedAt] of Object.entries(parsed.completed)) {
    const id = v1GlobalId(localId);
    if (!next.completed[id] && !next.orphans.completed[id]) next.completed[id] = { completedAt };
  }
  for (const v1Id of Object.keys(parsed.checklist)) {
    const id = v1ChecklistIdToV2(v1Id);
    if (id && !next.checklist[id] && !next.orphans.checklist[id]) next.checklist[id] = true;
  }
  if (parsed.lastVisited && !next.lastVisited[LEGACY_V1_COURSE_ID]) {
    next.lastVisited[LEGACY_V1_COURSE_ID] = { itemId: v1GlobalId(parsed.lastVisited.lessonId), at: parsed.lastVisited.at };
  }
  next.appliedMigrations = [...next.appliedMigrations, KUBERNETES_V1_MIGRATION];
  return { state: next, changed: true };
}

const KNOWN_SET: Record<EntryKind, keyof KnownIds> = { completed: 'items', checklist: 'checklistItems', quizzes: 'quizzes', questions: 'questions' };

/** Checklist ids embed the lab id (`<labId>#<anchor>`); an aliased lab renames its steps too. */
function resolveId(kind: EntryKind, id: string, known: KnownIds, aliases: Record<string, string>): string | null {
  const set = known[KNOWN_SET[kind]];
  if (set.has(id)) return id;
  if (aliases[id] && set.has(aliases[id])) return aliases[id];
  if (kind === 'checklist') {
    const hash = id.indexOf('#');
    const labAlias = hash > 0 ? aliases[id.slice(0, hash)] : undefined;
    const candidate = labAlias ? `${labAlias}${id.slice(hash)}` : null;
    if (candidate && set.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Moves entries for ids missing from the catalog into `orphans`, and restores
 * orphans whose id (or alias) exists again. Existing entries always win over
 * restored ones. Idempotent: reconciling twice equals reconciling once.
 */
export function reconcileProgress(
  state: ProgressState,
  known: KnownIds,
  aliases: Record<string, string> = {},
): { state: ProgressState; changed: boolean } {
  const next: ProgressState = structuredClone(state);
  let changed = false;

  for (const kind of ['completed', 'checklist', 'quizzes', 'questions'] as const) {
    const live = next[kind] as Record<string, unknown>;
    const orphans = next.orphans[kind] as Record<string, unknown>;

    for (const [id, value] of Object.entries(live)) {
      const resolved = resolveId(kind, id, known, aliases);
      if (resolved === id) continue;
      delete live[id];
      changed = true;
      if (resolved && live[resolved] === undefined) live[resolved] = value;
      else if (!resolved) orphans[id] = value;
    }
    for (const [id, value] of Object.entries(orphans)) {
      const resolved = resolveId(kind, id, known, aliases);
      if (!resolved) continue;
      delete orphans[id];
      changed = true;
      if (live[resolved] === undefined) live[resolved] = value;
    }
  }
  return { state: changed ? next : state, changed };
}

/** Clears progress but keeps migration markers so legacy data is not re-imported. */
export function resetProgressState(state: ProgressState): ProgressState {
  return { ...createEmptyProgress(), appliedMigrations: [...state.appliedMigrations] };
}

export function withCompletion(state: ProgressState, itemId: string, isComplete: boolean, now: Date): ProgressState {
  const completed = { ...state.completed };
  if (isComplete) completed[itemId] = { completedAt: now.toISOString() };
  else delete completed[itemId];
  return { ...state, completed };
}

export function withChecklistItem(state: ProgressState, itemId: string, isChecked: boolean): ProgressState {
  const checklist = { ...state.checklist };
  if (isChecked) checklist[itemId] = true;
  else delete checklist[itemId];
  return { ...state, checklist };
}

export function withVisit(state: ProgressState, courseId: string, itemId: string, now: Date): ProgressState {
  return { ...state, lastVisited: { ...state.lastVisited, [courseId]: { itemId, at: now.toISOString() } } };
}

export function withQuizAttempt(
  state: ProgressState,
  quizId: string,
  attempt: { score: number; total: number; incorrectQuestionIds: string[] },
  now: Date,
): ProgressState {
  const previous = state.quizzes[quizId];
  const result: QuizResult = {
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, attempt.score),
    lastScore: attempt.score,
    total: attempt.total,
    lastAttemptAt: now.toISOString(),
    incorrectQuestionIds: attempt.incorrectQuestionIds,
  };
  return { ...state, quizzes: { ...state.quizzes, [quizId]: result } };
}

export function withQuestionResult(state: ProgressState, questionId: string, result: QuestionOutcome, now: Date): ProgressState {
  const attempts = (state.questions[questionId]?.attempts ?? 0) + 1;
  return { ...state, questions: { ...state.questions, [questionId]: { result, attempts, lastAt: now.toISOString() } } };
}
