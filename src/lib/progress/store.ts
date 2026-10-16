'use client';

import { useSyncExternalStore } from 'react';
import { catalog } from '@/lib/catalog';
import { ID_ALIASES } from './aliases';
import {
  LEGACY_V1_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  createEmptyProgress,
  migrateKubernetesV1,
  parseProgress,
  reconcileProgress,
  resetProgressState,
  withChecklistItem,
  withCompletion,
  withQuestionResult,
  withQuizAttempt,
  withVisit,
  type ProgressState,
  type QuestionOutcome,
} from './model';

/**
 * Client store for learning progress in localStorage (no account or server).
 *
 * Ownership: this module is the only reader/writer of the progress keys.
 * Components read through `useProgress()` and mutate through the exported
 * actions. On first subscription it migrates v1 data and reconciles ids with
 * the current catalog. Other tabs stay in sync through the `storage` event.
 */

const SERVER_STATE = createEmptyProgress();
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState: ProgressState = SERVER_STATE;
/** Fallback when localStorage is unavailable (private mode, blocked storage): progress lasts for the session. */
let memoryState: ProgressState | null = null;
let isInitialized = false;
let hasWarnedUnavailable = false;

function readKey(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    if (!hasWarnedUnavailable) {
      hasWarnedUnavailable = true;
      console.warn('[progress] localStorage is unavailable; progress will not persist.', error);
    }
    return null;
  }
}

function getSnapshot(): ProgressState {
  if (memoryState) return memoryState;
  const raw = readKey(PROGRESS_STORAGE_KEY);
  // Return the same object until storage changes, as useSyncExternalStore requires.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    const { state, problem } = parseProgress(raw);
    if (problem) console.warn(`[progress] Stored progress ignored (${problem}); it stays in storage until you save new progress.`);
    cachedState = state;
  }
  return cachedState;
}

function getServerSnapshot(): ProgressState {
  return SERVER_STATE;
}

function write(next: ProgressState): void {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    memoryState = null;
  } catch (error) {
    console.warn('[progress] Could not save progress to localStorage; keeping it in memory.', error);
    memoryState = next;
  }
  for (const listener of listeners) listener();
}

/** One-time per page load: import v1 progress, then park/restore ids against the current catalog. */
function initialize(): void {
  if (isInitialized) return;
  isInitialized = true;
  const migration = migrateKubernetesV1(getSnapshot(), readKey(LEGACY_V1_STORAGE_KEY));
  const reconciled = reconcileProgress(migration.state, catalog.knownIds, ID_ALIASES);
  if (migration.changed || reconciled.changed) write(reconciled.state);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  initialize();
  const onStorage = (event: StorageEvent): void => {
    if (event.key === PROGRESS_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function update(mutate: (state: ProgressState) => ProgressState): void {
  write(mutate(getSnapshot()));
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setItemComplete(itemId: string, isComplete: boolean): void {
  update((state) => withCompletion(state, itemId, isComplete, new Date()));
}

export function setChecklistItem(itemId: string, isChecked: boolean): void {
  update((state) => withChecklistItem(state, itemId, isChecked));
}

export function recordVisit(courseId: string, itemId: string): void {
  if (getSnapshot().lastVisited[courseId]?.itemId === itemId) return;
  update((state) => withVisit(state, courseId, itemId, new Date()));
}

export function recordQuizAttempt(quizId: string, attempt: { score: number; total: number; incorrectQuestionIds: string[] }): void {
  update((state) => withQuizAttempt(state, quizId, attempt, new Date()));
}

export function recordQuestionResult(questionId: string, result: QuestionOutcome): void {
  update((state) => withQuestionResult(state, questionId, result, new Date()));
}

export function resetProgress(): void {
  update(resetProgressState);
}
