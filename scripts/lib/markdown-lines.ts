/**
 * Line-level Markdown helpers that understand fenced code blocks, so prose
 * transforms never touch commands, YAML or shell comments (`# ...`) inside code.
 */

export interface MarkdownLine {
  text: string;
  /** True for fence delimiters and every line between them. */
  isCode: boolean;
  /** True only for an opening fence line. */
  isFenceOpen: boolean;
}

// Matches an opening/closing fence: optional indentation, 3+ backticks or tildes, then the info string.
const FENCE_PATTERN = /^(\s*)(`{3,}|~{3,})(.*)$/;

export function classifyLines(source: string): MarkdownLine[] {
  const lines = source.split('\n');
  const result: MarkdownLine[] = [];
  let openFence: { char: string; length: number } | null = null;

  for (const text of lines) {
    const match = FENCE_PATTERN.exec(text);
    if (openFence === null) {
      // A backtick fence's info string may not contain backticks (CommonMark 4.5).
      const isOpening = match !== null && !(match[2][0] === '`' && match[3].includes('`'));
      if (isOpening) {
        openFence = { char: match[2][0], length: match[2].length };
        result.push({ text, isCode: true, isFenceOpen: true });
        continue;
      }
      result.push({ text, isCode: false, isFenceOpen: false });
      continue;
    }

    const isClosing =
      match !== null &&
      match[2][0] === openFence.char &&
      match[2].length >= openFence.length &&
      match[3].trim() === '';
    if (isClosing) openFence = null;
    result.push({ text, isCode: true, isFenceOpen: false });
  }
  return result;
}

export function joinLines(lines: MarkdownLine[]): string {
  return lines.map((line) => line.text).join('\n');
}

// An ATX heading: 1-6 hashes followed by whitespace or end of line.
const HEADING_PATTERN = /^(#{1,6})(\s.*)?$/;

export function parseHeading(text: string): { depth: number; text: string } | null {
  const match = HEADING_PATTERN.exec(text);
  if (!match) return null;
  return { depth: match[1].length, text: (match[2] ?? '').trim() };
}

/** Demotes an ATX heading by one level, capped at h6. */
export function demoteHeading(text: string): string {
  const heading = parseHeading(text);
  if (!heading || heading.depth >= 6) return text;
  return `#${text}`;
}

/**
 * Applies `transform` to the parts of a prose line that are outside inline
 * code spans. Code spans are delimited by equal-length backtick runs.
 */
export function mapOutsideInlineCode(line: string, transform: (segment: string) => string): string {
  let output = '';
  let cursor = 0;
  while (cursor < line.length) {
    const tickStart = line.indexOf('`', cursor);
    if (tickStart === -1) break;
    let tickEnd = tickStart;
    while (line[tickEnd] === '`') tickEnd += 1;
    const run = line.slice(tickStart, tickEnd);
    const closing = findClosingRun(line, tickEnd, run.length);
    if (closing === -1) break;
    output += transform(line.slice(cursor, tickStart)) + line.slice(tickStart, closing + run.length);
    cursor = closing + run.length;
  }
  return output + transform(line.slice(cursor));
}

function findClosingRun(line: string, from: number, length: number): number {
  let index = from;
  while (index < line.length) {
    const start = line.indexOf('`', index);
    if (start === -1) return -1;
    let end = start;
    while (line[end] === '`') end += 1;
    if (end - start === length) return start;
    index = end;
  }
  return -1;
}

/**
 * Escapes `<` that would otherwise start raw HTML (e.g. `<pod>` placeholders in
 * prose), which the Markdown renderer drops. Already-escaped `\<` and autolinks
 * such as `<https://...>` are left alone.
 */
export function escapeRawHtml(segment: string): string {
  // `<` not preceded by a backslash, followed by a tag-name start, `/`, `!` or `?`,
  // and not an autolink scheme (http:, https:, mailto:).
  return segment.replace(/(?<!\\)<(?=[A-Za-z/!?])(?!(?:https?|mailto):)/g, '&lt;');
}

// ChatGPT export citation markers, e.g. `:chatgpt-content-reference{index="1"}`.
export const CHATGPT_REFERENCE_PATTERN = /[ \t]?:chatgpt-content-reference\{[^}]*\}/g;

// A display-math line exported as `\\[ ... \\]` (escaped brackets on one line).
const DISPLAY_MATH_LINE = /^\s*\\\\\[(.*)\\\\\]\s*$/;

export function convertDisplayMath(line: string): string[] | null {
  const match = DISPLAY_MATH_LINE.exec(line);
  if (!match) return null;
  return ['$$', match[1].trim(), '$$'];
}

// Inline links and images: `[text](target)` / `![alt](target "title")`.
const LINK_TARGET_PATTERN = /(!?\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;

export function rewriteLinkTargets(segment: string, rewrite: (target: string, isImage: boolean) => string): string {
  return segment.replace(LINK_TARGET_PATTERN, (_whole, opener: string, target: string, closer: string) => {
    return `${opener}${rewrite(target, opener.startsWith('!'))}${closer}`;
  });
}

const HTML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1].toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return HTML_ENTITIES[entity.toLowerCase()] ?? whole;
  });
}

// TOC row: | 7 | [Lab 7 - ...](#lab-07) | [`labs/lab-07-slug.md`](../labs/lab-07-slug.md) |
export const LAB_TOC_ROW_PATTERN = /^\|\s*(\d+)\s*\|.*\(\.\.\/labs\/(lab-\d+-[a-z0-9-]+)\.md\)\s*\|\s*$/;

/** TOC heading, table header/divider and the rule after it; replaced by the All Labs page. */
export function isLabsTocChrome(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed === '## Table of Contents' ||
    trimmed === '| # | Lab | Source |' ||
    /^\|[-|\s]+\|$/.test(trimmed) ||
    trimmed === '---'
  );
}
