/**
 * Checks for the course imported from awesome-ai-engineer-interview:
 *   - the vendor snapshot is unmodified (checksums) and every upstream file is accounted for;
 *   - every imported page keeps every source word, in order (only titles and link targets move);
 *   - the question bank matches the upstream counts, each question's anchor exists on its
 *     lesson page, its HTML stays within the raw-HTML policy, and its links resolve;
 *   - license and provenance are present.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Catalog, QuestionBank } from '../../src/domain/types';
import type { ContentPage } from '../validate-content';
import { COURSE_ID, EXPECTED_QUESTION_COUNTS, LESSONS, QUESTION_SETS, UPSTREAM } from '../importers/ai-engineer-interview.config';
import { VENDOR_ROOT, accountForUpstreamFiles, readUpstreamMetadata } from '../importers/ai-engineer-interview';
import { countQuestionHeadings } from '../importers/markdown-question-parser';
import { classifyLines, parseHeading } from '../lib/markdown-lines';
import { QUESTION_BANKS_ROOT } from '../lib/paths';
import { findRawHtmlViolations, htmlLinkTargets } from '../lib/raw-html-policy';
import { firstDifference, tokenize } from '../lib/word-preservation';
import { sha256 } from '../lib/upstream-snapshot';

interface CheckContext {
  catalog: Catalog;
  pages: Map<string, ContentPage>;
  report: (message: string) => void;
  checkLink: (url: string, where: string, page: ContentPage) => void;
}

function withoutFirstH1(markdown: string): string {
  const lines = classifyLines(markdown);
  const index = lines.findIndex((line) => !line.isCode && parseHeading(line.text)?.depth === 1);
  return lines.filter((_, lineIndex) => lineIndex !== index).map((line) => line.text).join('\n');
}

export function checkAiEngineerInterview({ catalog, pages, report, checkLink }: CheckContext): void {
  const course = catalog.courses.find((candidate) => candidate.id === COURSE_ID);
  if (!course) {
    report(`Course ${COURSE_ID} is missing from the catalog`);
    return;
  }

  let metadata: ReturnType<typeof readUpstreamMetadata>;
  try {
    metadata = readUpstreamMetadata();
    accountForUpstreamFiles(metadata);
  } catch (error) {
    report(error instanceof Error ? error.message : String(error));
    return;
  }
  for (const file of metadata.files) {
    if (sha256(path.join(VENDOR_ROOT, file)) !== metadata.checksums[file]) report(`vendor snapshot file ${file} was modified; re-run \`pnpm import:ai-interview\``);
  }

  const lessonsById = new Map(catalog.lessons.filter((lesson) => lesson.courseId === COURSE_ID).map((lesson) => [lesson.localId, lesson]));
  for (const source of LESSONS) {
    const lesson = lessonsById.get(source.id);
    const page = lesson && pages.get(lesson.url.toLowerCase());
    if (!lesson || !page) {
      report(`${source.path}: no lesson page (expected id ${source.id})`);
      continue;
    }
    const raw = fs.readFileSync(path.join(VENDOR_ROOT, source.path), 'utf8').replace(/\r\n/g, '\n');
    const hasH1 = withoutFirstH1(raw) !== raw;
    const expected = tokenize(raw);
    const actual = tokenize(hasH1 ? `# ${page.title}\n${page.body}` : page.body);
    // The H1 moved to the title, so it is compared at the start rather than in its original position.
    const expectedInOrder = hasH1 ? tokenize(`# ${page.title}\n${withoutFirstH1(raw)}`) : expected;
    if (expected.length !== actual.length) report(`${source.path}: ${expected.length} source words but ${actual.length} on the page`);
    const difference = firstDifference(expectedInOrder, actual);
    if (difference) report(`${source.path}: content ${difference}`);
  }

  const bankFile = path.join(QUESTION_BANKS_ROOT, `${COURSE_ID}.json`);
  if (!fs.existsSync(bankFile)) {
    report(`Question bank for ${COURSE_ID} not generated`);
    return;
  }
  const bank = JSON.parse(fs.readFileSync(bankFile, 'utf8')) as QuestionBank;
  const multipleChoice = bank.questions.filter((question) => question.format === 'multiple-choice').length;
  const openEnded = bank.questions.length - multipleChoice;
  if (multipleChoice !== EXPECTED_QUESTION_COUNTS.multipleChoice || openEnded !== EXPECTED_QUESTION_COUNTS.openEnded) {
    report(`Question bank has ${multipleChoice} multiple-choice + ${openEnded} open-ended; upstream states ${EXPECTED_QUESTION_COUNTS.multipleChoice} + ${EXPECTED_QUESTION_COUNTS.openEnded}`);
  }
  for (const set of QUESTION_SETS) {
    const source = LESSONS.find((lesson) => lesson.id === set.lessonId);
    const summary = catalog.questionSets.find((candidate) => candidate.id === `${COURSE_ID}:${set.setId}`);
    if (!source || !summary) {
      report(`Question set ${set.setId} missing`);
      continue;
    }
    const headings = countQuestionHeadings(fs.readFileSync(path.join(VENDOR_ROOT, source.path), 'utf8'));
    if (headings !== summary.counts.total) report(`${source.path}: ${headings} question headings but ${summary.counts.total} parsed questions`);
  }
  for (const question of bank.questions) {
    const [pageUrl, anchor] = question.contextUrl.split('#');
    const page = pages.get(pageUrl.toLowerCase());
    if (!page) {
      report(`${question.id}: lesson page ${pageUrl} missing`);
      continue;
    }
    if (!page.anchors.has(anchor)) report(`${question.id}: anchor #${anchor} not found on ${pageUrl}`);
    if (question.format === 'multiple-choice') {
      const options = question.options ?? [];
      if (options.length < 2 || !options.some((option) => option.isCorrect)) report(`${question.id}: needs at least two options and one correct option`);
      if (!question.answerHtml && options.some((option) => !option.explanationHtml)) report(`${question.id}: missing option explanations`);
    } else if (!question.answerHtml) {
      report(`${question.id}: open-ended question without an answer`);
    }
    const html = [question.promptHtml, question.answerHtml ?? '', ...(question.options ?? []).flatMap((option) => [option.html, option.explanationHtml ?? ''])].join('\n');
    for (const violation of findRawHtmlViolations(html.replace(/<\/?(ul|ol|li|blockquote|pre|table|thead|tbody|tr|th|td|h[1-6]|hr)\b[^>]*>/g, ''))) {
      report(`${question.id}: ${violation}`);
    }
    for (const target of htmlLinkTargets(html)) checkLink(target, question.id, page);
  }

  if (!course.source?.upstream || course.source.upstream.commit !== UPSTREAM.ref) report(`${COURSE_ID}: course source/upstream commit missing or not ${UPSTREAM.ref}`);
  const licensePage = course.source?.licenseUrl && pages.get(course.source.licenseUrl.toLowerCase());
  const licenseText = fs.readFileSync(path.join(VENDOR_ROOT, 'LICENSE'), 'utf8').trim();
  if (!licensePage || !licensePage.body.includes(licenseText)) report(`${COURSE_ID}: license page missing or does not contain the upstream LICENSE verbatim`);
}
