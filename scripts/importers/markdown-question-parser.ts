/**
 * Parses question-bank Markdown in the awesome-ai-engineer-interview format
 * (documented in its questions/README.md) into structured questions. Text is
 * kept as the original Markdown; conversion to HTML happens in the importer.
 *
 *   ### Q7. <prompt>                      (also "### C3. <prompt>", "### Prompt A — <prompt>")
 *   > **Difficulty:** 🟡 Medium · `[topic] id` · 🔮 Representative | ✅ Reported ([src](url), ...)
 *   - <option>                            multiple choice: options, correct ones marked "✅ "
 *   - ✅ <correct option>
 *   <details><summary>…</summary>
 *   - **<option>** — why                  per-option explanation, same order as the options
 *   </details>
 *
 * Questions without a <details> block are open-ended: everything after the
 * difficulty line is the answer ("Senior frame", "What it tests", ...).
 */
import type { Difficulty } from '../../src/domain/schema';
import { classifyLines } from '../lib/markdown-lines';

export interface ParsedOption {
  markdown: string;
  isCorrect: boolean;
  explanationMarkdown?: string;
}

export interface ParsedQuestion {
  label: string;
  promptMarkdown: string;
  /** Heading text as written, used to find the heading's anchor on the rendered page. */
  headingText: string;
  section?: string;
  difficulty?: Difficulty;
  tags: string[];
  provenance?: { kind: 'reported' | 'representative'; sources: { label: string; url: string }[] };
  format: 'multiple-choice' | 'open-ended';
  options?: ParsedOption[];
  answerMarkdown?: string;
  /** Non-fatal parse issues (e.g. explanation count != option count). */
  warnings: string[];
}

// "### Q12. Prompt", "### C3. Prompt", "### Prompt A — Prompt"
const QUESTION_HEADING = /^###\s+(Q\d+|C\d+|Prompt [A-Z])(?:\.|\s+—)\s+(.+)$/;
const SECTION_HEADING = /^##\s+(.+)$/;
const META_LINE = /^>\s*\*\*Difficulty:\*\*/;
const DIFFICULTY_WORD = /\b(Easy|Medium|Hard)\b/;
// A Markdown link: [label](url)
const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
// Inline code spans holding tags, e.g. `[llm-features] llm1`
const TAG_SPAN = /`(\[[^`]+)`/g;
const CORRECT_MARK = /^✅\s*/;

function parseMeta(line: string): Pick<ParsedQuestion, 'difficulty' | 'tags' | 'provenance'> {
  const difficulty = DIFFICULTY_WORD.exec(line)?.[1].toLowerCase() as Difficulty | undefined;
  const tags = [...line.matchAll(TAG_SPAN)].map((match) => match[1]);
  const reportedIndex = line.indexOf('✅ Reported');
  if (reportedIndex !== -1) {
    const sources = [...line.slice(reportedIndex).matchAll(MARKDOWN_LINK)].map((match) => ({ label: match[1], url: match[2] }));
    return { difficulty, tags, provenance: { kind: 'reported', sources } };
  }
  if (line.includes('Representative')) return { difficulty, tags, provenance: { kind: 'representative', sources: [] } };
  return { difficulty, tags };
}

/** Top-level "- " list items; indented continuation lines are joined to their item. */
function listItems(lines: string[]): string[] {
  const items: string[] = [];
  for (const line of lines) {
    if (/^- /.test(line)) items.push(line.slice(2));
    else if (/^\s{2,}\S/.test(line) && items.length > 0) items[items.length - 1] += `\n${line.trim()}`;
  }
  return items;
}

function parseMultipleChoice(body: string[], question: ParsedQuestion): void {
  const open = body.findIndex((line) => line.trimStart().startsWith('<details'));
  const close = body.findIndex((line, index) => index > open && line.trim() === '</details>');
  const options: ParsedOption[] = listItems(body.slice(0, open)).map((text) => ({ markdown: text.replace(CORRECT_MARK, ''), isCorrect: CORRECT_MARK.test(text) }));
  const explanationLines = body.slice(open + 1, close === -1 ? undefined : close);
  const explanations = listItems(explanationLines);

  question.format = 'multiple-choice';
  question.options = options;
  if (options.length < 2) question.warnings.push('fewer than two options');
  if (!options.some((option) => option.isCorrect)) question.warnings.push('no option marked correct');
  if (explanations.length === options.length) {
    explanations.forEach((text, index) => {
      options[index].explanationMarkdown = text.replace(CORRECT_MARK, '');
      if (CORRECT_MARK.test(text) !== options[index].isCorrect) question.warnings.push(`explanation ${index + 1} correctness marker differs from its option`);
    });
  } else {
    // Keep the explanation block whole rather than guess which line belongs to which option.
    question.answerMarkdown = explanationLines.join('\n').trim();
    question.warnings.push(`${explanations.length} explanations for ${options.length} options; kept as one block`);
  }
}

export function parseQuestionFile(markdown: string): ParsedQuestion[] {
  const lines = classifyLines(markdown.replace(/\r\n/g, '\n'));
  const questions: ParsedQuestion[] = [];
  let section: string | undefined;
  let current: { question: ParsedQuestion; body: string[] } | null = null;

  const finish = (): void => {
    if (!current) return;
    const { question, body } = current;
    const metaIndex = body.findIndex((line) => META_LINE.test(line));
    const rest = metaIndex === -1 ? body : body.filter((_, index) => index !== metaIndex);
    if (metaIndex !== -1) Object.assign(question, parseMeta(body[metaIndex]));
    else question.warnings.push('no difficulty line');
    if (rest.some((line) => line.trimStart().startsWith('<details'))) parseMultipleChoice(rest, question);
    else question.answerMarkdown = rest.join('\n').trim();
    if (question.format === 'open-ended' && !question.answerMarkdown) question.warnings.push('no answer text');
    questions.push(question);
    current = null;
  };

  for (const line of lines) {
    if (!line.isCode) {
      const heading = QUESTION_HEADING.exec(line.text);
      if (heading) {
        finish();
        current = {
          question: { label: heading[1], promptMarkdown: heading[2].trim(), headingText: line.text.replace(/^###\s+/, ''), section, tags: [], format: 'open-ended', warnings: [] },
          body: [],
        };
        continue;
      }
      const sectionHeading = SECTION_HEADING.exec(line.text);
      if (sectionHeading || /^###\s/.test(line.text) || line.text.trim() === '---') {
        finish();
        if (sectionHeading) section = sectionHeading[1].trim();
        continue;
      }
    }
    current?.body.push(line.text);
  }
  finish();
  return questions;
}

/** Independent count of question headings, used to prove the parser saw every question. */
export function countQuestionHeadings(markdown: string): number {
  return classifyLines(markdown).filter((line) => !line.isCode && QUESTION_HEADING.test(line.text)).length;
}
