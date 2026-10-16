import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

/**
 * Markdown -> sanitized HTML for content stored as data (question prompts,
 * options, answers). Uses GitHub's sanitization schema (rehype-sanitize
 * default), so imported third-party text cannot inject scripts, styles or
 * event handlers when rendered with dangerouslySetInnerHTML.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // GitHub's schema prefixes ids with "user-content-"; keep plain ids off entirely instead.
  .use(rehypeSanitize, { ...defaultSchema, clobberPrefix: '' })
  .use(rehypeStringify);

export function markdownToHtml(markdown: string): string {
  return String(processor.processSync(markdown)).trim();
}

/** For one-line fragments (a prompt or option): drops the wrapping <p> so it can sit inline. */
export function inlineMarkdownToHtml(markdown: string): string {
  const html = markdownToHtml(markdown);
  const single = /^<p>([\s\S]*)<\/p>$/.exec(html);
  return single && !single[1].includes('<p>') ? single[1] : html;
}
