/**
 * Imports the Kubernetes course from the read-only Markdown in `../progress`.
 *
 * Output (gitignored, rebuilt on every generate):
 *   content/courses/kubernetes/learn/<module>/<slug>.md   lessons
 *   content/courses/kubernetes/labs/<slug>.md             labs
 *   content/courses/kubernetes/labs/index.md              labs intro
 *   public/content-assets/kubernetes/                     images copied from progress/
 *   src/generated/kubernetes-import-report.json
 *
 * Every change to source text is one of the transforms documented in
 * plans/261016-1355-k8s-learning-hub/plan.md; `validate-content.ts` proves no words were lost.
 */
import fs from 'node:fs';
import path from 'node:path';
import { bundledLanguages, bundledLanguagesAlias } from 'shiki';
import type { CourseManifest } from '../../src/domain/schema';
import { REPOSITORY } from '../../src/config/site';
import { slugifyTitle } from '../lib/markdown-ast';
import {
  CHATGPT_REFERENCE_PATTERN,
  LAB_TOC_ROW_PATTERN,
  classifyLines,
  convertDisplayMath,
  decodeHtmlEntities,
  demoteHeading,
  escapeRawHtml,
  isLabsTocChrome,
  mapOutsideInlineCode,
  parseHeading,
  rewriteLinkTargets,
  type MarkdownLine,
} from '../lib/markdown-lines';
import { ASSETS_ROOT, ASSETS_URL, COURSES_ROOT, GENERATED_ROOT, labsIndexUrl } from '../lib/paths';
import { NOTES_REPO_PATH, NOTES_SNAPSHOT_ROOT, noteLinkRepoPath, readNotesSnapshot } from './kubernetes-snapshot';
import {
  COURSE_ID,
  EXPECTED_LAB_COUNT,
  FENCE_LANGUAGE_FALLBACK,
  LAB_MODULES,
  RELATED_LABS,
  SOURCES,
  labLocalId,
  type GuideSource,
  type LabsBundleSource,
  type LessonLabel,
  type SingleSource,
} from './kubernetes-progress.config';

/** The importer reads the committed, redacted snapshot of ../progress (see kubernetes-snapshot.ts). */
export const PROGRESS_ROOT = NOTES_SNAPSHOT_ROOT;
const COURSE_ROOT = path.join(COURSES_ROOT, COURSE_ID);
export const LEARN_ROOT = path.join(COURSE_ROOT, 'learn');
export const LABS_ROOT = path.join(COURSE_ROOT, 'labs');
export const LABS_INDEX_FILE = path.join(LABS_ROOT, 'index.md');
const COURSE_ASSETS_ROOT = path.join(ASSETS_ROOT, COURSE_ID);
const COURSE_ASSETS_URL = `${ASSETS_URL}/${COURSE_ID}`;
const REPORT_JSON = path.join(GENERATED_ROOT, 'kubernetes-import-report.json');

interface DraftLesson {
  type: 'lesson';
  id: string;
  label: LessonLabel;
  module: string;
  title: string;
  slug: string;
  lang: string;
  sourceFile: string;
  bodyLines: MarkdownLine[];
}

interface DraftLab {
  type: 'lab';
  id: string;
  number: number;
  module: string;
  title: string;
  slug: string;
  lang: string;
  sourceFile: string;
  bodyLines: MarkdownLine[];
}

type DraftPage = DraftLesson | DraftLab;

interface ImportReport {
  sources: number;
  lessons: number;
  labs: number;
  chatgptReferencesRemoved: Record<string, number>;
  rawHtmlEscaped: Record<string, number>;
  displayMathConverted: Record<string, number>;
  fenceLanguageFallbacks: Record<string, number>;
  linksRewritten: Record<string, number>;
  imagesCopied: string[];
  unresolvedLinks: { page: string; target: string }[];
}

const SUPPORTED_FENCE_LANGUAGES = new Set([
  ...Object.keys(bundledLanguages),
  ...Object.keys(bundledLanguagesAlias),
  'text',
  'txt',
  'plaintext',
]);

function emptyReport(): ImportReport {
  return {
    sources: 0,
    lessons: 0,
    labs: 0,
    chatgptReferencesRemoved: {},
    rawHtmlEscaped: {},
    displayMathConverted: {},
    fenceLanguageFallbacks: {},
    linksRewritten: {},
    imagesCopied: [],
    unresolvedLinks: [],
  };
}

let report: ImportReport = emptyReport();

function increment(counter: Record<string, number>, key: string, by = 1): void {
  if (by === 0) return;
  counter[key] = (counter[key] ?? 0) + by;
}

function fail(message: string): never {
  throw new Error(`[import:kubernetes] ${message}`);
}

function readSource(file: string): string {
  const absolute = path.join(PROGRESS_ROOT, file);
  if (!fs.existsSync(absolute)) fail(`Configured source not found: progress/${file}`);
  return fs.readFileSync(absolute, 'utf8').replace(/\r\n/g, '\n');
}

function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}

/** Removes the first H1 and returns it as the page title. */
function takeTitle(lines: MarkdownLine[], file: string): { title: string; rest: MarkdownLine[] } {
  const index = lines.findIndex((line) => !line.isCode && parseHeading(line.text)?.depth === 1);
  if (index === -1) fail(`No H1 title in progress/${file}`);
  const leading = lines.slice(0, index).filter((line) => line.text.trim() !== '');
  if (leading.length > 0) fail(`Content before the H1 in progress/${file} would be lost`);
  const heading = parseHeading(lines[index].text);
  return { title: decodeHtmlEntities(heading?.text ?? ''), rest: lines.slice(index + 1) };
}

function extractSingle(source: SingleSource): DraftLesson[] {
  const { title, rest } = takeTitle(classifyLines(readSource(source.file)), source.file);
  const slug = source.slug;
  return [
    {
      type: 'lesson',
      id: source.id,
      label: source.label,
      module: source.module,
      title,
      slug,
      lang: source.lang,
      sourceFile: source.file,
      bodyLines: rest,
    },
  ];
}

// A top-level guide part heading, e.g. "# Phần 3 — Health Probes".
const GUIDE_PART_PATTERN = /^Phần\s+(\d+)\s+—\s+(.+)$/;

function extractGuide(source: GuideSource): DraftLesson[] {
  const { title, rest } = takeTitle(classifyLines(readSource(source.file)), source.file);
  const pages: DraftLesson[] = [
    {
      type: 'lesson',
      id: `${source.module}-overview`,
      label: 'Overview',
      module: source.module,
      title,
      slug: 'overview',
      lang: source.lang,
      sourceFile: source.file,
      bodyLines: [],
    },
  ];

  for (const line of rest) {
    const heading = line.isCode ? null : parseHeading(line.text);
    const part = heading?.depth === 1 ? GUIDE_PART_PATTERN.exec(heading.text) : null;
    if (!part || !heading) {
      pages[pages.length - 1].bodyLines.push(line);
      continue;
    }
    const partNumber = Number(part[1]);
    if (partNumber !== pages.length) fail(`progress/${source.file}: expected Phần ${pages.length}, found Phần ${partNumber}`);
    pages.push({
      type: 'lesson',
      id: `${source.module}-part-${padNumber(partNumber)}`,
      label: 'Guide',
      module: source.module,
      title: decodeHtmlEntities(heading.text),
      slug: `part-${padNumber(partNumber)}-${slugifyTitle(part[2])}`,
      lang: source.lang,
      sourceFile: source.file,
      bodyLines: [],
    });
  }
  return pages;
}

// Lab anchor emitted by the bundle generator, e.g. `<a id="lab-07"></a>`.
const LAB_ANCHOR_PATTERN = /^<a id="lab-(\d+)"><\/a>\s*$/;
// Lab heading inside the bundle, e.g. "Lab 7 - Deployments and Rollout Strategies".
const LAB_TITLE_PATTERN = /^Lab\s+(\d+)\s+-\s+.+$/;

interface LabsBundle {
  title: string;
  introLines: MarkdownLine[];
  labs: DraftLab[];
}

function extractLabsBundle(source: LabsBundleSource): LabsBundle {
  const { title, rest } = takeTitle(classifyLines(readSource(source.file)), source.file);
  const labSlugs = new Map<number, string>();
  const introLines: MarkdownLine[] = [];
  const segments: { number: number; lines: MarkdownLine[] }[] = [];

  for (const line of rest) {
    const anchor = line.isCode ? null : LAB_ANCHOR_PATTERN.exec(line.text);
    if (anchor) {
      segments.push({ number: Number(anchor[1]), lines: [] });
      continue;
    }
    if (segments.length > 0) {
      segments[segments.length - 1].lines.push(line);
      continue;
    }
    const tocRow = LAB_TOC_ROW_PATTERN.exec(line.text);
    if (tocRow) {
      labSlugs.set(Number(tocRow[1]), tocRow[2]);
      continue;
    }
    if (isLabsTocChrome(line.text)) continue;
    introLines.push(line);
  }

  return { title, introLines, labs: segments.map((segment) => toLab(segment, labSlugs, source)) };
}

function toLab(
  segment: { number: number; lines: MarkdownLine[] },
  labSlugs: Map<number, string>,
  source: LabsBundleSource,
): DraftLab {
  const headingIndex = segment.lines.findIndex((line) => !line.isCode && parseHeading(line.text) !== null);
  const heading = headingIndex === -1 ? null : parseHeading(segment.lines[headingIndex].text);
  const titleMatch = heading ? LAB_TITLE_PATTERN.exec(heading.text) : null;
  if (!heading || !titleMatch) fail(`Lab anchor lab-${padNumber(segment.number)} is not followed by a "Lab N - Title" heading`);
  if (Number(titleMatch[1]) !== segment.number) fail(`Anchor lab-${segment.number} has heading "${heading.text}"`);
  const leading = segment.lines.slice(0, headingIndex).filter((line) => line.text.trim() !== '');
  if (leading.length > 0) fail(`Content between anchor and heading of lab ${segment.number} would be lost`);

  return {
    type: 'lab',
    id: labLocalId(segment.number),
    number: segment.number,
    module: labModule(segment.number),
    title: decodeHtmlEntities(heading.text),
    slug: labSlugs.get(segment.number) ?? fail(`Lab ${segment.number} missing from the bundle's table of contents`),
    lang: source.lang,
    sourceFile: source.file,
    bodyLines: segment.lines.slice(headingIndex + 1),
  };
}

function labModule(labNumber: number): string {
  const owners = Object.entries(LAB_MODULES).filter(([, numbers]) => numbers.includes(labNumber));
  if (owners.length !== 1) fail(`Lab ${labNumber} must belong to exactly one module in LAB_MODULES (found ${owners.length})`);
  return owners[0][0];
}

interface LinkContext {
  pageId: string;
  sourceFile: string;
  labUrls: Map<number, string>;
  sourceUrls: Map<string, string>;
  copiedImages: Map<string, string>;
  /** Parent-repository files the notes may link to (recorded in the snapshot). */
  repoFiles: Set<string>;
}

function githubBlobUrl(repoRelativePath: string): string {
  const encoded = repoRelativePath.split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${REPOSITORY.owner}/${REPOSITORY.name}/blob/${REPOSITORY.branch}/${encoded}`;
}

function copyImage(absolute: string, context: LinkContext): string {
  const existing = context.copiedImages.get(absolute);
  if (existing) return existing;
  const extension = path.extname(absolute).toLowerCase();
  const name = `${slugifyTitle(path.basename(absolute, extension))}${extension}`;
  const url = `${COURSE_ASSETS_URL}/${name}`;
  if ([...context.copiedImages.values()].includes(url)) fail(`Image name collision: ${name}`);
  fs.copyFileSync(absolute, path.join(COURSE_ASSETS_ROOT, name));
  context.copiedImages.set(absolute, url);
  report.imagesCopied.push(`${NOTES_REPO_PATH}/${path.relative(PROGRESS_ROOT, absolute)}`);
  return url;
}

function unresolved(target: string, context: LinkContext): string {
  report.unresolvedLinks.push({ page: context.pageId, target });
  return target;
}

function resolveLink(target: string, isImage: boolean, context: LinkContext): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) return target;

  const labAnchor = /^#lab-(\d+)$/.exec(target);
  if (labAnchor) {
    increment(report.linksRewritten, 'lab-anchor');
    return context.labUrls.get(Number(labAnchor[1])) ?? unresolved(target, context);
  }
  if (target.startsWith('#')) return target;

  const hash = target.split('#', 2)[1];
  const suffix = hash ? `#${hash}` : '';
  // Resolve as if from the notes' original place in the parent repository (progress/).
  const repoRelative = noteLinkRepoPath(context.sourceFile, target);
  const progressRelative = repoRelative.startsWith(`${NOTES_REPO_PATH}/`) ? repoRelative.slice(NOTES_REPO_PATH.length + 1) : null;

  if (isImage) {
    const absolute = progressRelative ? path.join(PROGRESS_ROOT, progressRelative) : null;
    if (!absolute || !fs.existsSync(absolute)) return unresolved(target, context);
    increment(report.linksRewritten, 'image');
    return copyImage(absolute, context);
  }

  const labFile = /^labs\/lab-(\d+)-[a-z0-9-]+\.md$/.exec(repoRelative);
  if (labFile && context.labUrls.has(Number(labFile[1]))) {
    increment(report.linksRewritten, 'lab-file');
    return `${context.labUrls.get(Number(labFile[1]))}${suffix}`;
  }
  if (repoRelative === 'labs/README.md') {
    increment(report.linksRewritten, 'labs-index');
    return labsIndexUrl(COURSE_ID);
  }
  const sourceUrl = progressRelative ? context.sourceUrls.get(progressRelative) : undefined;
  if (sourceUrl) {
    increment(report.linksRewritten, 'progress-note');
    return `${sourceUrl}${suffix}`;
  }
  if (context.repoFiles.has(repoRelative)) {
    increment(report.linksRewritten, 'github-blob');
    return `${githubBlobUrl(repoRelative)}${suffix}`;
  }
  return unresolved(target, context);
}

function rewriteFenceLanguage(text: string): string {
  // Opening fence: indentation, fence run, then the language as the first word of the info string.
  const match = /^(\s*(?:`{3,}|~{3,}))(\S*)(.*)$/.exec(text);
  if (!match || match[2] === '') return text;
  const language = match[2].toLowerCase();
  if (SUPPORTED_FENCE_LANGUAGES.has(language)) return text;
  increment(report.fenceLanguageFallbacks, language);
  return `${match[1]}${FENCE_LANGUAGE_FALLBACK}${match[3]}`;
}

function transformProseLine(text: string, context: LinkContext): string {
  const withoutReferences = text.replace(CHATGPT_REFERENCE_PATTERN, () => {
    increment(report.chatgptReferencesRemoved, context.sourceFile);
    return '';
  });
  const linked = rewriteLinkTargets(withoutReferences, (target, isImage) => resolveLink(target, isImage, context));
  const escaped = mapOutsideInlineCode(linked, (segment) => {
    const result = escapeRawHtml(segment);
    const added = (result.match(/&lt;/g)?.length ?? 0) - (segment.match(/&lt;/g)?.length ?? 0);
    increment(report.rawHtmlEscaped, context.sourceFile, added);
    return result;
  });
  return demoteHeading(escaped);
}

function transformBody(lines: MarkdownLine[], context: LinkContext): string {
  const output: string[] = [];
  for (const line of lines) {
    if (line.isFenceOpen) {
      output.push(rewriteFenceLanguage(line.text));
      continue;
    }
    if (line.isCode) {
      output.push(line.text);
      continue;
    }
    const math = convertDisplayMath(line.text);
    if (math) {
      increment(report.displayMathConverted, context.sourceFile);
      output.push(...math);
      continue;
    }
    output.push(transformProseLine(line.text, context));
  }
  return `${output.join('\n').trim()}\n`;
}

function frontmatter(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

function assertAllSourcesClaimed(): void {
  const onDisk = fs.readdirSync(PROGRESS_ROOT).filter((name) => name.endsWith('.md'));
  const claimed = new Set(SOURCES.map((source) => source.file));
  const unclaimed = onDisk.filter((name) => !claimed.has(name));
  if (unclaimed.length > 0) fail(`Markdown in progress/ not listed in kubernetes-progress.config.ts: ${unclaimed.join(', ')}`);
  if (claimed.size !== SOURCES.length) fail('A source file is listed more than once in SOURCES');
}

function assertModulesExist(course: CourseManifest, pages: DraftPage[]): void {
  const moduleIds = new Set(course.modules.map((module) => module.id));
  for (const moduleId of Object.keys(LAB_MODULES)) {
    if (!moduleIds.has(moduleId)) fail(`LAB_MODULES uses module "${moduleId}" missing from course.json`);
  }
  for (const page of pages) {
    if (!moduleIds.has(page.module)) fail(`${page.id} uses module "${page.module}" missing from course.json`);
  }
}

function assertRelationsResolve(pages: DraftPage[]): void {
  const ids = new Set(pages.map((page) => page.id));
  for (const [lessonId, labNumbers] of Object.entries(RELATED_LABS)) {
    if (!ids.has(lessonId)) fail(`RELATED_LABS references unknown lesson "${lessonId}"`);
    for (const labNumber of labNumbers) {
      if (!ids.has(labLocalId(labNumber))) fail(`RELATED_LABS["${lessonId}"] references unknown lab ${labNumber}`);
    }
  }
}

function collectDraftPages(): { pages: DraftPage[]; bundle: LabsBundle; bundleFile: string } {
  const pages: DraftPage[] = [];
  let bundle: LabsBundle | null = null;
  let bundleFile = '';
  for (const source of SOURCES) {
    report.sources += 1;
    if (source.type === 'single') pages.push(...extractSingle(source));
    else if (source.type === 'guide') pages.push(...extractGuide(source));
    else {
      if (bundle) fail('Only one labs bundle is supported');
      bundle = extractLabsBundle(source);
      bundleFile = source.file;
      pages.push(...bundle.labs);
    }
  }
  if (!bundle) fail('No labs bundle in SOURCES');
  const numbers = bundle.labs.map((lab) => lab.number).join(',');
  const expected = Array.from({ length: EXPECTED_LAB_COUNT }, (_, index) => index + 1).join(',');
  if (numbers !== expected) fail(`Labs must be numbered 1-${EXPECTED_LAB_COUNT} in order; found ${numbers}`);
  return { pages, bundle, bundleFile };
}

function pageUrl(page: DraftPage): string {
  return page.type === 'lab'
    ? `${labsIndexUrl(COURSE_ID)}/${page.slug}`
    : `/courses/${COURSE_ID}/learn/${page.module}/${page.slug}`;
}

function pageFile(page: DraftPage): string {
  return page.type === 'lab' ? path.join(LABS_ROOT, `${page.slug}.md`) : path.join(LEARN_ROOT, page.module, `${page.slug}.md`);
}

function cleanOutput(): void {
  for (const directory of [LEARN_ROOT, LABS_ROOT, COURSE_ASSETS_ROOT]) {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function importKubernetesCourse(course: CourseManifest): ImportReport {
  report = emptyReport();
  if (course.id !== COURSE_ID) fail(`Importer is for course "${COURSE_ID}", got "${course.id}"`);
  if (!fs.existsSync(PROGRESS_ROOT)) fail(`Notes snapshot not found: ${PROGRESS_ROOT}`);
  assertAllSourcesClaimed();
  cleanOutput();

  const { pages, bundle, bundleFile } = collectDraftPages();
  assertModulesExist(course, pages);
  assertRelationsResolve(pages);

  const labUrls = new Map(pages.flatMap((page) => (page.type === 'lab' ? [[page.number, pageUrl(page)] as const] : [])));
  const sourceUrls = new Map<string, string>();
  for (const page of pages) if (!sourceUrls.has(page.sourceFile)) sourceUrls.set(page.sourceFile, pageUrl(page));
  const copiedImages = new Map<string, string>();
  const repoFiles = new Set(readNotesSnapshot().repoFiles);
  const orderInModule = new Map<string, number>();

  for (const page of pages) {
    const context: LinkContext = { pageId: page.id, sourceFile: page.sourceFile, labUrls, sourceUrls, copiedImages, repoFiles };
    const body = transformBody(page.bodyLines, context);
    if (body.trim() === '') fail(`Page ${page.id} (${page.sourceFile}) has no content`);
    const file = pageFile(page);
    fs.mkdirSync(path.dirname(file), { recursive: true });

    if (page.type === 'lab') {
      report.labs += 1;
      const fields = { type: 'lab', id: page.id, title: page.title, module: page.module, order: page.number, number: page.number, lang: page.lang, source: page.sourceFile };
      fs.writeFileSync(file, `${frontmatter(fields)}${body}`);
      continue;
    }
    report.lessons += 1;
    const order = orderInModule.get(page.module) ?? 0;
    orderInModule.set(page.module, order + 1);
    const fields = {
      type: 'lesson',
      id: page.id,
      title: page.title,
      module: page.module,
      order,
      label: page.label,
      lang: page.lang,
      relatedLabs: (RELATED_LABS[page.id] ?? []).map(labLocalId),
      source: page.sourceFile,
    };
    fs.writeFileSync(file, `${frontmatter(fields)}${body}`);
  }

  const intro = transformBody(bundle.introLines, { pageId: 'labs-index', sourceFile: bundleFile, labUrls, sourceUrls, copiedImages, repoFiles });
  fs.writeFileSync(
    LABS_INDEX_FILE,
    `${frontmatter({ type: 'course-page', title: bundle.title, description: 'All 46 hands-on labs in curriculum order, with completion status.', source: bundleFile })}${intro}`,
  );

  fs.mkdirSync(GENERATED_ROOT, { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  if (report.unresolvedLinks.length > 0) {
    fail(`Unresolved links:\n${report.unresolvedLinks.map((link) => `  ${link.page}: ${link.target}`).join('\n')}`);
  }
  return report;
}
