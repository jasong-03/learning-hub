/**
 * Renamed lesson, lab or quiz ids: old global id -> new global id.
 *
 * When an id changes, add an entry here instead of losing learners' progress.
 * Saved progress for the old id is moved to the new one on next load
 * (see reconcileProgress). A lab alias also carries its checklist steps over.
 * Example: 'kubernetes:note-03': 'kubernetes:deployments'.
 */
export const ID_ALIASES: Record<string, string> = {};
