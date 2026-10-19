import { nodeTypes } from '@mdx-js/mdx';
import { defineConfig } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import { remarkGithubAlerts } from './src/lib/mdx/remark-github-alerts';
import { remarkImageCards } from './src/lib/mdx/remark-image-cards';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [remarkMath, remarkGithubAlerts, remarkImageCards, ...plugins],
    // rehype-raw parses raw HTML in .md files (e.g. <details> in imported GitHub Markdown).
    // Which tags may appear is enforced at build time by scripts/validate-content.ts (RAW_HTML_POLICY).
    // MDX node types pass through untouched so components like images keep working.
    rehypePlugins: (plugins) => [[rehypeRaw, { passThrough: [...nodeTypes] }], rehypeKatex, ...plugins],
    remarkImageOptions: { external: false },
  },
});
