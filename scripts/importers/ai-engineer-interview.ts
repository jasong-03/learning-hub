/**
 * Builds the "AI Engineer Interview Preparation" course from the unmodified
 * upstream snapshot in vendor/awesome-ai-engineer-interview (see
 * scripts/vendor-github-repo.ts). Offline and deterministic: the same snapshot
 * always produces the same files.
 *
 * Output (gitignored, rebuilt on every `pnpm generate`):
 *   content/courses/ai-engineer-interview/learn/<module>/<slug>.md   one lesson per upstream file
 *   content/courses/ai-engineer-interview/questions/<set>.json       structured question bank
 *   content/courses/ai-engineer-interview/upstream.json              provenance (commit, date, contributors)
 *
 * Transforms (everything else is byte-for-byte the upstream Markdown):
 *   1. The first H1 becomes the frontmatter title (README.md has none; its title comes from the config).
 *   2. Relative links/images are rewritten to hub URLs, or to GitHub at the pinned commit for files not imported.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { CourseManifest, QuestionFile, QuestionSetFile } from '../../src/domain/schema';
import { analyzeMarkdown } from '../lib/markdown-ast';
import { inlineMarkdownToHtml, markdownToHtml } from '../lib/markdown-html';
import { classifyLines, parseHeading } from '../lib/markdown-lines';
import { APP_ROOT, COURSES_ROOT, courseUrl } from '../lib/paths';
import type { UpstreamMetadata } from '../lib/upstream-snapshot';
import {
  COURSE_ID,
  DIRECTORY_LINKS,
  LESSONS,
  NON_LESSON_FILES,
  QUESTION_SETS,
  SOURCE_LESSON,
  UPSTREAM,
  VENDOR_DIR,
  VENDOR_EXCLUDE,
  type LessonSource,
} from './ai-engineer-interview.config';
import { parseQuestionFile, type ParsedQuestion } from './markdown-question-parser';

export const VENDOR_ROOT = path.join(APP_ROOT, VENDOR_DIR);
const COURSE_ROOT = path.join(COURSES_ROOT, COURSE_ID);
export const LEARN_ROOT = path.join(COURSE_ROOT, 'learn');
export const QUESTIONS_ROOT = path.join(COURSE_ROOT, 'questions');
const UPSTREAM_FILE = path.join(COURSE_ROOT, 'upstream.json');

/** Title for files that have no H1 upstream (README.md opens with a banner image whose alt text is this). */
const TITLE_OVERRIDES: Record<string, string> = { 'README.md': 'Awesome AI Engineer Interview' };

interface ImportReport {
  lessons: number;
  questionSets: number;
  multipleChoice: number;
  openEnded: number;
  linksRewritten: Record<string, number>;
  parseWarnings: string[];
}

function fail(message: string): never {
  throw new Error(`[import:${COURSE_ID}] ${message}`);
}

export function readUpstreamMetadata(): UpstreamMetadata {
  const file = path.join(VENDOR_ROOT, 'UPSTREAM.json');
  if (!fs.existsSync(file)) fail(`Vendor snapshot missing (${VENDOR_DIR}). Run \`pnpm import:ai-interview\`.`);
  const metadata = JSON.parse(fs.readFileSync(file, 'utf8')) as UpstreamMetadata;
  if (metadata.commit !== UPSTREAM.ref) {
    fail(`Vendor snapshot is at ${metadata.commit} but the config pins ${UPSTREAM.ref}. Run \`pnpm import:ai-interview\`.`);
  }
  return metadata;
}

/** Every upstream file is a lesson, rendered elsewhere, or excluded with a reason, and nothing configured is missing. */
export function accountForUpstreamFiles(metadata: UpstreamMetadata): void {
  const claimed = new Set([...LESSONS.map((lesson) => lesson.path), ...NON_LESSON_FILES.map((file) => file.path)]);
  const unclaimed = metadata.files.filter((file) => !claimed.has(file));
  if (unclaimed.length > 0) fail(`Upstream files not mapped in ai-engineer-interview.config.ts: ${unclaimed.join(', ')}`);
  const missing = [...claimed].filter((file) => !metadata.files.includes(file));
  if (missing.length > 0) fail(`Configured files missing from the snapshot: ${missing.join(', ')}`);
  if (new Set(LESSONS.map((lesson) => lesson.id)).size !== LESSONS.length) fail('Duplicate lesson id in LESSONS');
}

const lessonUrl = (lesson: Pick<LessonSource, 'module' | 'slug'>): string => `${courseUrl(COURSE_ID)}/learn/${lesson.module}/${lesson.slug}`;

class LinkResolver {
  readonly counts: Record<string, number> = {};
  private readonly lessonsByPath = new Map(LESSONS.map((lesson) => [lesson.path, lesson]));

  constructor(private readonly metadata: UpstreamMetadata) {}

  private count(kind: string): void {
    this.counts[kind] = (this.counts[kind] ?? 0) + 1;
  }

  private githubUrl(upstreamPath: string, isDirectory: boolean): string {
    return `${UPSTREAM.url}/${isDirectory ? 'tree' : 'blob'}/${this.metadata.commit}/${upstreamPath}`;
  }

  resolve(target: string, fromPath: string): string {
    // External, same-page and already-rewritten site-absolute targets pass through.
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('/') || target.startsWith('#')) return target;
    const [rawPath, hash] = target.split('#', 2);
    const suffix = hash ? `#${hash}` : '';
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), decodeURIComponent(rawPath)));
    const trimmed = resolved.replace(/\/$/, '');
    if (trimmed.startsWith('..')) fail(`${fromPath}: link "${target}" leaves the repository`);

    const lesson = this.lessonsByPath.get(trimmed);
    if (lesson) {
      this.count('lesson');
      return `${lessonUrl(lesson)}${suffix}`;
    }
    if (trimmed in DIRECTORY_LINKS) {
      this.count('directory');
      const relative = DIRECTORY_LINKS[trimmed];
      return `${courseUrl(COURSE_ID)}${relative ? `/${relative}` : ''}`;
    }
    if (trimmed === 'LICENSE') {
      this.count('license');
      return lessonUrl(SOURCE_LESSON);
    }
    const excluded = VENDOR_EXCLUDE.find((entry) => trimmed === entry.path || trimmed.startsWith(`${entry.path}/`));
    if (excluded || this.metadata.files.includes(trimmed)) {
      this.count('github');
      return `${this.githubUrl(trimmed, rawPath.endsWith('/'))}${suffix}`;
    }
    return fail(`${fromPath}: cannot resolve link "${target}"`);
  }

  /** Rewrites Markdown link/image targets and raw-HTML href/src attributes on prose lines. */
  rewriteMarkdown(markdown: string, fromPath: string): string {
    return classifyLines(markdown)
      .map((line) => {
        if (line.isCode) return line.text;
        // Every "](target)" — this also reaches links wrapping an image badge, e.g. [![MIT](badge.svg)](../LICENSE).
        const linked = line.text.replace(/\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (_whole, target: string, title: string) => `](${this.resolve(target, fromPath)}${title})`);
        return linked.replace(/\b(href|src)="([^"]+)"/g, (_whole, attribute: string, value: string) => `${attribute}="${this.resolve(value, fromPath)}"`);
      })
      .join('\n');
  }
}

function frontmatter(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/** Removes the first H1 outside code and returns it as the title. */
function takeTitle(markdown: string, upstreamPath: string): { title: string; body: string } {
  const lines = classifyLines(markdown);
  const index = lines.findIndex((line) => !line.isCode && parseHeading(line.text)?.depth === 1);
  if (index === -1) {
    const title = TITLE_OVERRIDES[upstreamPath] ?? fail(`${upstreamPath} has no H1 and no title override`);
    return { title, body: markdown };
  }
  const title = parseHeading(lines[index].text)?.text ?? '';
  return { title, body: lines.filter((_, lineIndex) => lineIndex !== index).map((line) => line.text).join('\n') };
}

function stripTagSpans(text: string): string {
  return text.replace(/`\[[^`]*`/g, '').trim();
}

function toQuestion(
  parsed: ParsedQuestion,
  idPrefix: string,
  anchor: string,
  rewrite: (markdown: string) => string,
  resolveUrl: (url: string) => string,
): QuestionFile {
  const localId = `${idPrefix}-${parsed.label.toLowerCase().replace(/\s+/g, '-')}`;
  return {
    id: localId,
    label: parsed.label,
    format: parsed.format,
    promptHtml: inlineMarkdownToHtml(rewrite(parsed.promptMarkdown)),
    difficulty: parsed.difficulty,
    section: parsed.section ? stripTagSpans(parsed.section) : undefined,
    tags: parsed.tags,
    provenance: parsed.provenance && {
      kind: parsed.provenance.kind,
      sources: parsed.provenance.sources.map((source) => ({ label: source.label, url: resolveUrl(source.url) })),
    },
    anchor,
    options: parsed.options?.map((option, index) => ({
      id: String.fromCharCode(97 + index),
      html: inlineMarkdownToHtml(rewrite(option.markdown)),
      explanationHtml: option.explanationMarkdown ? inlineMarkdownToHtml(rewrite(option.explanationMarkdown)) : undefined,
      isCorrect: option.isCorrect,
    })),
    answerHtml: parsed.answerMarkdown ? markdownToHtml(rewrite(parsed.answerMarkdown)) : undefined,
  };
}

function writeQuestionSet(lesson: LessonSource, body: string, resolver: LinkResolver, report: ImportReport): void {
  const config = QUESTION_SETS.find((set) => set.lessonId === lesson.id);
  if (!config) return;
  const parsed = parseQuestionFile(body);
  // Question headings are h3; match them to the page's heading anchors in document order.
  const questionHeadings = analyzeMarkdown(body).headings.filter((heading) => heading.depth === 3 && /^(Q\d+|C\d+|Prompt [A-Z])\b/.test(heading.text));
  if (questionHeadings.length !== parsed.length) fail(`${lesson.path}: ${parsed.length} questions but ${questionHeadings.length} question headings`);

  const rewrite = (markdown: string): string => resolver.rewriteMarkdown(markdown, lesson.path);
  const resolveUrl = (url: string): string => resolver.resolve(url, lesson.path);
  const questions = parsed.map((question, index) => toQuestion(question, config.questionIdPrefix, questionHeadings[index].id, rewrite, resolveUrl));
  for (const question of parsed) report.parseWarnings.push(...question.warnings.map((warning) => `${lesson.path} ${question.label}: ${warning}`));
  report.multipleChoice += questions.filter((question) => question.format === 'multiple-choice').length;
  report.openEnded += questions.filter((question) => question.format === 'open-ended').length;
  report.questionSets += 1;

  const set: QuestionSetFile = { id: config.setId, topic: config.topic, lessonId: lesson.id, relatedLessonIds: config.relatedLessonIds, questions };
  fs.writeFileSync(path.join(QUESTIONS_ROOT, `${config.setId}.json`), `${JSON.stringify(set, null, 2)}\n`);
}

function writeSourceLesson(metadata: UpstreamMetadata, order: number): void {
  const license = fs.readFileSync(path.join(VENDOR_ROOT, 'LICENSE'), 'utf8').trimEnd();
  const body = [
    '> [!NOTE]',
    '> This page is a Learning Hub addition. Every other page in this course is imported from the upstream repository without rewriting; only titles were moved into page metadata and relative links were pointed at the matching pages here.',
    '',
    '## Source',
    '',
    '| | |',
    '|---|---|',
    `| Repository | [${metadata.repository}](${metadata.url}) |`,
    `| Imported commit | [\`${metadata.commit}\`](${metadata.url}/tree/${metadata.commit}) (${metadata.commitDate.slice(0, 10)}) |`,
    `| Imported on | ${metadata.importedAt} |`,
    `| Contributors | ${metadata.contributors.join(', ')} |`,
    '| License | MIT (full text below) |',
    `| Not imported | ${metadata.excluded.map((entry) => `\`${entry.path}\` (${entry.reason})`).join('; ')} |`,
    '',
    '## License',
    '',
    '```text',
    license,
    '```',
    '',
  ].join('\n');
  const fields = { type: 'lesson', id: SOURCE_LESSON.id, title: 'Source & License', module: SOURCE_LESSON.module, order, label: 'Hub', lang: 'en' };
  const file = path.join(LEARN_ROOT, SOURCE_LESSON.module, `${SOURCE_LESSON.slug}.md`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${frontmatter(fields)}${body}`);
}

export function importAiEngineerInterviewCourse(course: CourseManifest): ImportReport {
  if (course.id !== COURSE_ID) fail(`Importer is for course "${COURSE_ID}", got "${course.id}"`);
  const metadata = readUpstreamMetadata();
  accountForUpstreamFiles(metadata);
  const moduleIds = new Set(course.modules.map((module) => module.id));
  for (const lesson of LESSONS) if (!moduleIds.has(lesson.module)) fail(`${lesson.path} uses module "${lesson.module}" missing from course.json`);

  for (const directory of [LEARN_ROOT, QUESTIONS_ROOT]) {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory, { recursive: true });
  }

  const resolver = new LinkResolver(metadata);
  const report: ImportReport = { lessons: 0, questionSets: 0, multipleChoice: 0, openEnded: 0, linksRewritten: resolver.counts, parseWarnings: [] };
  const orderInModule = new Map<string, number>();

  for (const lesson of LESSONS) {
    const raw = fs.readFileSync(path.join(VENDOR_ROOT, lesson.path), 'utf8').replace(/\r\n/g, '\n');
    const { title, body } = takeTitle(raw, lesson.path);
    const rewritten = resolver.rewriteMarkdown(body, lesson.path);
    const order = orderInModule.get(lesson.module) ?? 0;
    orderInModule.set(lesson.module, order + 1);

    const fields = { type: 'lesson', id: lesson.id, title, module: lesson.module, order, label: lesson.label, lang: 'en', source: lesson.path };
    const file = path.join(LEARN_ROOT, lesson.module, `${lesson.slug}.md`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${frontmatter(fields)}${rewritten.replace(/^\n+/, '')}`);
    report.lessons += 1;
    writeQuestionSet(lesson, rewritten, resolver, report);
  }

  writeSourceLesson(metadata, orderInModule.get(SOURCE_LESSON.module) ?? 0);
  const upstream = {
    repository: metadata.repository,
    url: metadata.url,
    commit: metadata.commit,
    commitDate: metadata.commitDate,
    importedAt: metadata.importedAt,
    contributors: metadata.contributors,
  };
  fs.writeFileSync(UPSTREAM_FILE, `${JSON.stringify(upstream, null, 2)}\n`);
  if (report.parseWarnings.length > 0) fail(`Question parse warnings:\n  ${report.parseWarnings.join('\n  ')}`);
  return report;
}
