/**
 * Validates generated content and the catalog. Exits non-zero on: stale or
 * invalid catalog or question banks, duplicate ids/URLs/slugs, pages without
 * catalog entries, empty pages, broken internal links or anchors, missing
 * images, raw HTML outside the allowed policy, labs without checklists, and
 * words lost from imported sources (Kubernetes notes, AI interview repository).
 */
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import matter from 'gray-matter';
import { REPOSITORY } from '../src/config/site';
import type { Catalog, QuestionBank } from '../src/domain/types';
import { LABS_INDEX_FILE, PROGRESS_ROOT } from './importers/kubernetes-progress';
import { COURSE_ID as KUBERNETES_ID, SOURCES as KUBERNETES_SOURCES } from './importers/kubernetes-progress.config';
import { CatalogError, buildCatalog, listFiles } from './lib/catalog-builder';
import { analyzeMarkdown } from './lib/markdown-ast';
import { CHATGPT_REFERENCE_PATTERN, LAB_TOC_ROW_PATTERN, classifyLines, isLabsTocChrome } from './lib/markdown-lines';
import { APP_ROOT, CATALOG_JSON, COURSES_ROOT, GENERATED_ROOT, PUBLIC_ROOT, QUESTION_BANKS_ROOT, contentFileUrl } from './lib/paths';
import { NOTES_SNAPSHOT_ROOT, NOTES_SOURCE_ROOT, applyRedactions, loadRedactions, readNotesSnapshot } from './importers/kubernetes-snapshot';
import { findRawHtmlViolations, htmlLinkTargets, rawHtmlAnchors } from './lib/raw-html-policy';
import { firstDifference, tokenize } from './lib/word-preservation';
import { checkAiEngineerInterview } from './checks/ai-engineer-interview';

const errors: string[] = [];
const report = (message: string): void => {
  errors.push(message);
};

const NOTES_REPO_FILES = new Set(readNotesSnapshot().repoFiles);
const GITHUB_BLOB_PREFIX = `https://github.com/${REPOSITORY.owner}/${REPOSITORY.name}/blob/${REPOSITORY.branch}/`;
/** App routes that are not content pages but are valid link targets. */
const STATIC_ROUTES = ['/dashboard', '/courses', '/paths', '/practice', '/review', '/analytics'];

export interface ContentPage {
  file: string;
  url: string;
  title: string;
  body: string;
  anchors: Set<string>;
  structure: ReturnType<typeof analyzeMarkdown>;
}

function loadPages(): Map<string, ContentPage> {
  const pages = new Map<string, ContentPage>();
  for (const file of listFiles(COURSES_ROOT, /\.mdx?$/)) {
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const url = contentFileUrl(file);
    const where = path.relative(APP_ROOT, file);
    const existing = pages.get(url.toLowerCase());
    if (existing) report(`Duplicate URL/slug ${url}: ${where} and ${path.relative(APP_ROOT, existing.file)}`);
    if (!/^[a-z0-9/-]+$/.test(url)) report(`${where}: URL ${url} is not lowercase kebab-case`);
    if (parsed.content.trim() === '') report(`${where}: empty page`);
    const structure = analyzeMarkdown(parsed.content);
    pages.set(url.toLowerCase(), {
      file,
      url,
      title: String(parsed.data.title ?? ''),
      body: parsed.content,
      anchors: new Set([
        ...structure.headings.map((heading) => heading.id),
        ...structure.rawHtml.flatMap((html) => rawHtmlAnchors(html.value)),
      ]),
      structure,
    });
  }
  return pages;
}

function checkCatalog(catalog: Catalog, pages: Map<string, ContentPage>): void {
  try {
    // Round-trip through JSON so optional fields left undefined compare like the files on disk.
    const fresh = JSON.parse(JSON.stringify(buildCatalog())) as { catalog: Catalog; questionBanks: QuestionBank[] };
    if (!isDeepStrictEqual(fresh.catalog, catalog)) report('src/generated/catalog.json is stale; run `pnpm generate`');
    for (const bank of fresh.questionBanks) {
      if (!isDeepStrictEqual(bank, loadQuestionBank(bank.courseId))) report(`Question bank for ${bank.courseId} is stale; run \`pnpm generate\``);
    }
  } catch (error) {
    if (error instanceof CatalogError) error.problems.forEach(report);
    else throw error;
  }

  const unique = (kind: string, ids: string[]): void => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) report(`Duplicate ${kind} id ${id}`);
      seen.add(id);
    }
  };
  unique('category', catalog.categories.map((category) => category.id));
  unique('course', catalog.courses.map((course) => course.id));
  unique('module', catalog.modules.map((module) => module.id));
  unique('lesson/lab/quiz', [...catalog.lessons, ...catalog.labs, ...catalog.quizzes].map((item) => item.id));
  unique('path', catalog.paths.map((learningPath) => learningPath.id));
  unique('checklist item', catalog.labs.flatMap((lab) => lab.checklist.map((item) => item.id)));

  const itemUrls = new Set<string>();
  for (const item of [...catalog.lessons, ...catalog.labs]) {
    itemUrls.add(item.url.toLowerCase());
    if (!pages.has(item.url.toLowerCase())) report(`${item.id} has no page at ${item.url}`);
  }
  for (const page of pages.values()) {
    const isCoursePage = catalog.courses.some((course) => course.labsUrl === page.url);
    if (!itemUrls.has(page.url.toLowerCase()) && !isCoursePage) report(`${path.relative(APP_ROOT, page.file)} is not in the catalog`);
  }
  for (const lab of catalog.labs) {
    const page = pages.get(lab.url.toLowerCase());
    if (lab.checklist.length === 0) report(`${lab.id}: lab has no checklist items`);
    for (const item of lab.checklist) {
      if (page && !page.anchors.has(item.anchor)) report(`${lab.id}: checklist anchor #${item.anchor} not found on page`);
    }
  }
}

export function loadQuestionBank(courseId: string): QuestionBank | null {
  const file = path.join(QUESTION_BANKS_ROOT, `${courseId}.json`);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as QuestionBank) : null;
}

function isAppRoute(pathname: string, catalog: Catalog): boolean {
  return (
    STATIC_ROUTES.includes(pathname) ||
    catalog.courses.some((course) => course.url === pathname || course.labsUrl === pathname || course.questionsUrl === pathname) ||
    catalog.paths.some((learningPath) => learningPath.url === pathname)
  );
}

function checkLinks(pages: Map<string, ContentPage>, catalog: Catalog): void {
  for (const page of pages.values()) {
    const where = path.relative(APP_ROOT, page.file);
    for (const link of page.structure.links) checkLink(link.url, `${where}:${link.line}`, page, pages, catalog);
    for (const image of page.structure.images) checkImage(image.url, `${where}:${image.line}`);
    for (const html of page.structure.rawHtml) {
      for (const violation of findRawHtmlViolations(html.value)) report(`${where}:${html.line}: ${violation}`);
      for (const target of htmlLinkTargets(html.value)) checkLink(target, `${where}:${html.line}`, page, pages, catalog);
    }
  }
}

export function checkLink(url: string, where: string, page: ContentPage, pages: Map<string, ContentPage>, catalog: Catalog): void {
  if (url.startsWith(GITHUB_BLOB_PREFIX)) {
    const repoPath = decodeURIComponent(url.slice(GITHUB_BLOB_PREFIX.length).split('#')[0]);
    if (!NOTES_REPO_FILES.has(repoPath)) report(`${where}: GitHub link to a repo file the notes snapshot does not record: ${repoPath}`);
    return;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return;
  if (url.startsWith('#')) {
    if (!page.anchors.has(decodeURIComponent(url.slice(1)))) report(`${where}: anchor ${url} not found on page`);
    return;
  }
  if (!url.startsWith('/')) {
    // Relative links between authored pages are resolved by Fumadocs; check the target file exists.
    const target = path.resolve(path.dirname(page.file), decodeURIComponent(url.split('#')[0]));
    if (!fs.existsSync(target)) report(`${where}: relative link "${url}" points to a missing file`);
    return;
  }
  const [pathname, hash] = url.split('#', 2);
  const normalized = pathname.replace(/\/$/, '');
  const target = pages.get(normalized.toLowerCase());
  if (!target) {
    if (!isAppRoute(normalized, catalog) && !fs.existsSync(path.join(PUBLIC_ROOT, pathname))) report(`${where}: broken internal link ${url}`);
    return;
  }
  if (hash && !target.anchors.has(decodeURIComponent(hash))) report(`${where}: anchor #${hash} not found on ${pathname}`);
}

function checkImage(url: string, where: string): void {
  if (/^https?:/i.test(url)) return;
  if (!url.startsWith('/')) return; // relative images are imported (and verified) by the MDX compiler
  if (!fs.existsSync(path.join(PUBLIC_ROOT, decodeURIComponent(url)))) report(`${where}: missing image ${url}`);
}

/** Source text minus the removals the importer documents (export citations, lab anchors, labs TOC). */
function sourceTextAfterDocumentedRemovals(file: string, isLabsBundle: boolean): string {
  const lines = classifyLines(fs.readFileSync(path.join(PROGRESS_ROOT, file), 'utf8').replace(/\r\n/g, '\n'));
  let seenFirstLab = false;
  const kept: string[] = [];
  for (const line of lines) {
    if (line.isCode) {
      kept.push(line.isFenceOpen ? '```' : line.text);
      continue;
    }
    if (isLabsBundle && /^<a id="lab-\d+"><\/a>\s*$/.test(line.text)) {
      seenFirstLab = true;
      continue;
    }
    if (isLabsBundle && !seenFirstLab && (LAB_TOC_ROW_PATTERN.test(line.text) || isLabsTocChrome(line.text))) continue;
    kept.push(line.text.replace(CHATGPT_REFERENCE_PATTERN, ''));
  }
  return kept.join('\n');
}

function checkKubernetesPreservation(catalog: Catalog, pages: Map<string, ContentPage>): void {
  const moduleOrder = catalog.modules.filter((module) => module.courseId === KUBERNETES_ID).map((module) => module.id);
  const lessons = catalog.lessons
    .filter((lesson) => lesson.courseId === KUBERNETES_ID)
    .sort((a, b) => moduleOrder.indexOf(a.moduleId) - moduleOrder.indexOf(b.moduleId) || a.order - b.order);
  const labs = catalog.labs.filter((lab) => lab.courseId === KUBERNETES_ID).sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  for (const source of KUBERNETES_SOURCES) {
    const isLabsBundle = source.type === 'labs-bundle';
    const expected = tokenize(sourceTextAfterDocumentedRemovals(source.file, isLabsBundle));
    const parts: string[] = [];
    if (isLabsBundle) {
      const intro = pages.get(contentFileUrl(LABS_INDEX_FILE));
      if (!intro) {
        report(`Kubernetes labs intro page missing`);
        continue;
      }
      parts.push(`# ${intro.title}`, intro.body);
    }
    for (const item of [...lessons, ...labs].filter((candidate) => candidate.source === source.file)) {
      const page = pages.get(item.url.toLowerCase());
      if (page) parts.push(`# ${page.title}`, page.body);
    }
    compareTokens(source.file, expected, tokenize(parts.join('\n')));
  }
}

function compareTokens(file: string, expected: string[], actual: string[]): void {
  const difference = firstDifference(expected, actual);
  if (difference) report(`progress/${file}: content ${difference}`);
}

/**
 * The published notes snapshot must equal the redacted notes (when ../progress is
 * present), and no redacted value may appear in anything that gets published.
 */
function checkRedactions(): void {
  if (fs.existsSync(NOTES_SOURCE_ROOT)) {
    for (const file of fs.readdirSync(NOTES_SOURCE_ROOT).filter((name) => name.endsWith('.md'))) {
      const expected = applyRedactions(fs.readFileSync(path.join(NOTES_SOURCE_ROOT, file), 'utf8'));
      const snapshotFile = path.join(NOTES_SNAPSHOT_ROOT, file);
      if (!fs.existsSync(snapshotFile) || fs.readFileSync(snapshotFile, 'utf8') !== expected) report(`vendor/kubernetes-progress/${file} is out of date; run \`pnpm generate\``);
    }
  }
  // Local-only rules are applied when present (developer machines); the base rules always run.
  const rules = loadRedactions();
  const published = [NOTES_SNAPSHOT_ROOT, path.join(COURSES_ROOT, 'kubernetes')].flatMap((root) => listFiles(root, /\.(md|mdx|json)$/));
  for (const file of [...published, path.join(GENERATED_ROOT, 'catalog.json')]) {
    {
      const text = fs.readFileSync(file, 'utf8');
      for (const rule of rules) {
        if (new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', '')).test(text)) report(`${path.relative(APP_ROOT, file)}: contains a redacted value (${rule.reason})`);
      }
    }
  }
}

function main(): void {
  if (!fs.existsSync(CATALOG_JSON)) {
    console.error('[check:content] Generated catalog not found. Run `pnpm generate` first.');
    process.exit(1);
  }
  const catalog = JSON.parse(fs.readFileSync(CATALOG_JSON, 'utf8')) as Catalog;
  const pages = loadPages();

  checkCatalog(catalog, pages);
  checkLinks(pages, catalog);
  checkKubernetesPreservation(catalog, pages);
  checkRedactions();
  checkAiEngineerInterview({ catalog, pages, report, checkLink: (url, where, page) => checkLink(url, where, page, pages, catalog) });

  if (errors.length > 0) {
    console.error(`[check:content] ${errors.length} problem(s):\n${errors.map((error) => `  - ${error}`).join('\n')}`);
    process.exit(1);
  }
  const linkCount = [...pages.values()].reduce((sum, page) => sum + page.structure.links.length, 0);
  console.log(
    `[check:content] OK: ${catalog.courses.length} courses, ${pages.size} pages, ${catalog.lessons.length} lessons, ` +
      `${catalog.labs.length} labs, ${linkCount} links, ${catalog.quizzes.length} quizzes, ` +
      `${catalog.questionSets.reduce((sum, set) => sum + set.counts.total, 0)} questions, ${catalog.paths.length} paths; ` +
      `source words preserved (Kubernetes, AI Engineer Interview)`,
  );
}

main();
