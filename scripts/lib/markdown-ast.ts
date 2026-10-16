import GithubSlugger from 'github-slugger';
import type { Heading, Html, Image, Link, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toString } from 'mdast-util-to-string';
import { gfm } from 'micromark-extension-gfm';
import { visit } from 'unist-util-visit';

export interface HeadingInfo {
  depth: number;
  text: string;
  /** Anchor id as Fumadocs generates it: github-slugger over the heading's plain text, unique per page. */
  id: string;
}

export interface PageStructure {
  headings: HeadingInfo[];
  links: { url: string; line: number }[];
  images: { url: string; line: number }[];
  rawHtml: { value: string; line: number }[];
}

export function parseMarkdown(body: string): Root {
  return fromMarkdown(body, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
}

export function analyzeMarkdown(body: string): PageStructure {
  const tree = parseMarkdown(body);
  const slugger = new GithubSlugger();
  const structure: PageStructure = { headings: [], links: [], images: [], rawHtml: [] };

  visit(tree, (node) => {
    const line = node.position?.start.line ?? 0;
    if (node.type === 'heading') {
      const heading = node as Heading;
      const text = toString(heading);
      structure.headings.push({ depth: heading.depth, text, id: slugger.slug(text) });
    } else if (node.type === 'link') {
      structure.links.push({ url: (node as Link).url, line });
    } else if (node.type === 'image') {
      structure.images.push({ url: (node as Image).url, line });
    } else if (node.type === 'html') {
      structure.rawHtml.push({ value: (node as Html).value, line });
    }
  });
  return structure;
}

/** URL slug for titles that may contain Vietnamese diacritics ("Phần 1 — ConfigMap" -> "phan-1-configmap"). */
export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
