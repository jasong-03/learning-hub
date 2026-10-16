/**
 * Refreshes an unmodified upstream snapshot under vendor/ from a pinned Git ref.
 *
 *   pnpm import:ai-interview            # snapshot UPSTREAM.ref, then regenerate content
 *   pnpm import:ai-interview --ref <sha|branch|tag>
 *
 * Only this step needs the network; `pnpm generate` reads the snapshot offline.
 * Re-running with the same commit rewrites identical files (idempotent) and keeps
 * the original import date. No upstream code is executed: files are copied only.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { UPSTREAM, VENDOR_DIR, VENDOR_EXCLUDE } from './importers/ai-engineer-interview.config';
import { APP_ROOT } from './lib/paths';
import { UPSTREAM_METADATA_FILE, sha256, type UpstreamMetadata } from './lib/upstream-snapshot';

function git(args: string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function listFiles(root: string, relative = ''): string[] {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = path.posix.join(relative, entry.name);
    if (VENDOR_EXCLUDE.some((excluded) => excluded.path === child)) return [];
    if (entry.isSymbolicLink()) throw new Error(`Refusing to vendor symlink ${child}`);
    return entry.isDirectory() ? listFiles(root, child) : [child];
  });
}

function main(): void {
  const refFlag = process.argv.indexOf('--ref');
  const ref = refFlag !== -1 ? process.argv[refFlag + 1] : UPSTREAM.ref;
  if (!ref) throw new Error('--ref needs a value');

  const checkout = fs.mkdtempSync(path.join(os.tmpdir(), 'vendor-upstream-'));
  try {
    git(['init', '--quiet'], checkout);
    git(['remote', 'add', 'origin', `${UPSTREAM.url}.git`], checkout);
    // Full history without file contents: enough for the contributor list, cheap to fetch.
    git(['fetch', '--quiet', '--filter=blob:none', 'origin', ref], checkout);
    git(['checkout', '--quiet', 'FETCH_HEAD'], checkout);
    const commit = git(['rev-parse', 'HEAD'], checkout);
    const commitDate = git(['log', '-1', '--format=%cI'], checkout);
    const contributors = git(['shortlog', '-sn', '--no-merges', 'HEAD'], checkout)
      .split('\n')
      .map((line) => line.replace(/^\s*\d+\s+/, '').trim())
      .filter(Boolean);

    const destination = path.join(APP_ROOT, VENDOR_DIR);
    const metadataFile = path.join(destination, UPSTREAM_METADATA_FILE);
    const previous = fs.existsSync(metadataFile) ? (JSON.parse(fs.readFileSync(metadataFile, 'utf8')) as UpstreamMetadata) : null;

    const files = listFiles(checkout).sort();
    fs.rmSync(destination, { recursive: true, force: true });
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(destination, file)), { recursive: true });
      fs.copyFileSync(path.join(checkout, file), path.join(destination, file));
    }
    const metadata: UpstreamMetadata = {
      repository: UPSTREAM.repository,
      url: UPSTREAM.url,
      commit,
      commitDate,
      importedAt: previous?.commit === commit ? previous.importedAt : new Date().toISOString().slice(0, 10),
      contributors,
      excluded: VENDOR_EXCLUDE,
      files,
      checksums: Object.fromEntries(files.map((file) => [file, sha256(path.join(destination, file))])),
    };
    fs.writeFileSync(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);
    console.log(`[vendor] ${UPSTREAM.repository}@${commit.slice(0, 12)} (${commitDate}): ${files.length} files -> ${VENDOR_DIR}`);
    if (commit !== UPSTREAM.ref) console.log(`[vendor] Note: pin UPSTREAM.ref to ${commit} in ai-engineer-interview.config.ts to keep imports reproducible.`);
  } finally {
    fs.rmSync(checkout, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`[vendor] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
