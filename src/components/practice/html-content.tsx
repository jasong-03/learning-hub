import { cn } from '@/lib/utils';

/**
 * Renders question text stored as HTML. Safe because every HTML string is
 * produced at import time by scripts/lib/markdown-html.ts, which sanitizes with
 * GitHub's rehype-sanitize schema (no scripts, styles, event handlers or
 * javascript: URLs), and `pnpm check:content` re-checks it against the raw-HTML policy.
 */
export function HtmlContent({ html, inline = false, className }: { html: string; inline?: boolean; className?: string }) {
  const Tag = inline ? 'span' : 'div';
  return <Tag className={cn(!inline && 'prose max-w-none text-sm', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
