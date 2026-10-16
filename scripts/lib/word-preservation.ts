import { classifyLines, decodeHtmlEntities } from './markdown-lines';

/**
 * Word sequence of a Markdown document with link targets, raw-HTML href/src
 * values and fence info strings ignored and entities decoded. Comparing a
 * source with its generated page this way proves no prose, code or table text
 * was dropped or reordered, while allowing documented link rewrites.
 */
export function tokenize(markdown: string): string[] {
  const normalized = classifyLines(markdown)
    .map((line) => (line.isFenceOpen ? '```' : line.text))
    .join('\n')
    .replace(/\]\([^)\s]*(?:\s+"[^"]*")?\)/g, ']')
    .replace(/\b(?:href|src)="[^"]*"/g, '');
  return decodeHtmlEntities(normalized)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** First position where the sequences differ, with context, or null when identical. */
export function firstDifference(expected: string[], actual: string[]): string | null {
  const length = Math.max(expected.length, actual.length);
  for (let position = 0; position < length; position += 1) {
    if (expected[position] === actual[position]) continue;
    const context = (tokens: string[]): string => tokens.slice(Math.max(0, position - 6), position + 6).join(' ');
    return `differs at word ${position} of ${expected.length}\n    source:    ${context(expected)}\n    generated: ${context(actual)}`;
  }
  return null;
}
