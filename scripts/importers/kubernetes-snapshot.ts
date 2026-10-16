/**
 * Keeps vendor/kubernetes-progress in sync with ../progress (when the notes are
 * present locally): copies the Markdown with REDACTIONS applied, copies the
 * images, and records which files of the parent repository the notes link to,
 * so link rewriting works without the parent repository. Deterministic: the
 * same notes always produce the same snapshot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { classifyLines, rewriteLinkTargets } from '../lib/markdown-lines';
import { APP_ROOT, REPO_ROOT } from '../lib/paths';
import { sha256 } from '../lib/upstream-snapshot';
import { BASE_REDACTIONS, NOTES_SNAPSHOT_DIR, PROGRESS_DIR, REDACTIONS_LOCAL_FILE, type RedactionRule } from './kubernetes-progress.config';

export const NOTES_SOURCE_ROOT = path.resolve(APP_ROOT, PROGRESS_DIR);
export const NOTES_SNAPSHOT_ROOT = path.join(APP_ROOT, NOTES_SNAPSHOT_DIR);
const SNAPSHOT_METADATA = path.join(NOTES_SNAPSHOT_ROOT, 'SNAPSHOT.json');
/** Folder name of the notes inside the parent repository; links like ../labs/x.md resolve from here. */
export const NOTES_REPO_PATH = 'progress';

export interface NotesSnapshot {
  source: string;
  redactions: { reason: string; replacement: string; count: number }[];
  /** Parent-repository files (repo-relative) that the notes link to and that exist. */
  repoFiles: string[];
  checksums: Record<string, string>;
}

/** Base rules plus local-only rules from redactions.local.json: [{ "pattern", "flags", "replacement", "reason" }]. */
export function loadRedactions(): RedactionRule[] {
  const localFile = path.join(APP_ROOT, REDACTIONS_LOCAL_FILE);
  if (!fs.existsSync(localFile)) return BASE_REDACTIONS;
  const local = JSON.parse(fs.readFileSync(localFile, 'utf8')) as { pattern: string; flags?: string; replacement: string; reason: string }[];
  return [...BASE_REDACTIONS, ...local.map((rule) => ({ pattern: new RegExp(rule.pattern, rule.flags ?? 'g'), replacement: rule.replacement, reason: rule.reason }))];
}

export function applyRedactions(text: string, counts?: Map<string, number>): string {
  return loadRedactions().reduce((current, rule) => current.replace(rule.pattern, () => {
    counts?.set(rule.reason, (counts.get(rule.reason) ?? 0) + 1);
    return rule.replacement;
  }), text);
}

/** Repo-relative path a note's relative link points to, e.g. "../labs/x.md" from progress/ -> "labs/x.md". */
export function noteLinkRepoPath(sourceFile: string, target: string): string {
  const [rawPath] = target.split('#', 2);
  return path.posix.normalize(path.posix.join(NOTES_REPO_PATH, path.posix.dirname(sourceFile), decodeURIComponent(rawPath)));
}

function listSourceFiles(): string[] {
  const walk = (relative: string): string[] =>
    fs.readdirSync(path.join(NOTES_SOURCE_ROOT, relative), { withFileTypes: true }).flatMap((entry) => {
      if (entry.name === '.DS_Store') return [];
      const child = path.posix.join(relative, entry.name);
      return entry.isDirectory() ? walk(child) : [child];
    });
  return walk('').sort();
}

export function readNotesSnapshot(): NotesSnapshot {
  if (!fs.existsSync(SNAPSHOT_METADATA)) throw new Error(`[import:kubernetes] Notes snapshot missing (${NOTES_SNAPSHOT_DIR}); run \`pnpm generate\` with ../progress present`);
  return JSON.parse(fs.readFileSync(SNAPSHOT_METADATA, 'utf8')) as NotesSnapshot;
}

/** Returns false when ../progress is absent (e.g. CI/Vercel), in which case the committed snapshot is used as-is. */
export function refreshNotesSnapshot(): boolean {
  if (!fs.existsSync(NOTES_SOURCE_ROOT)) return false;
  if (!fs.existsSync(path.join(APP_ROOT, REDACTIONS_LOCAL_FILE))) {
    throw new Error(`[import:kubernetes] ${REDACTIONS_LOCAL_FILE} is missing; refusing to refresh the public snapshot without the local redaction rules`);
  }
  const counts = new Map<string, number>();
  const repoFiles = new Set<string>();
  const files = listSourceFiles();
  fs.rmSync(NOTES_SNAPSHOT_ROOT, { recursive: true, force: true });

  for (const file of files) {
    const source = path.join(NOTES_SOURCE_ROOT, file);
    const destination = path.join(NOTES_SNAPSHOT_ROOT, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!file.endsWith('.md')) {
      fs.copyFileSync(source, destination);
      continue;
    }
    const text = fs.readFileSync(source, 'utf8');
    for (const line of classifyLines(text)) {
      if (line.isCode) continue;
      rewriteLinkTargets(line.text, (target) => {
        if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#') || target.startsWith('/')) return target;
        const repoPath = noteLinkRepoPath(file, target);
        if (!repoPath.startsWith(`${NOTES_REPO_PATH}/`) && !repoPath.startsWith('..') && fs.existsSync(path.join(REPO_ROOT, repoPath))) repoFiles.add(repoPath);
        return target;
      });
    }
    fs.writeFileSync(destination, applyRedactions(text, counts));
  }

  const snapshot: NotesSnapshot = {
    source: PROGRESS_DIR,
    redactions: loadRedactions().map((rule) => ({ reason: rule.reason, replacement: rule.replacement, count: counts.get(rule.reason) ?? 0 })),
    repoFiles: [...repoFiles].sort(),
    checksums: Object.fromEntries(files.map((file) => [file, sha256(path.join(NOTES_SNAPSHOT_ROOT, file))])),
  };
  fs.writeFileSync(SNAPSHOT_METADATA, `${JSON.stringify(snapshot, null, 2)}\n`);
  return true;
}
