import { createHash } from 'node:crypto';
import fs from 'node:fs';

/** Metadata written next to a vendored upstream snapshot (vendor/<repo>/UPSTREAM.json). */
export interface UpstreamMetadata {
  repository: string;
  url: string;
  commit: string;
  commitDate: string;
  importedAt: string;
  /** Commit authors up to `commit` (names only, most commits first), for attribution. */
  contributors: string[];
  excluded: { path: string; reason: string }[];
  files: string[];
  /** SHA-256 of each vendored file, so `pnpm check:content` can prove the snapshot is unmodified. */
  checksums: Record<string, string>;
}

export const UPSTREAM_METADATA_FILE = 'UPSTREAM.json';

export function sha256(file: string): string {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
