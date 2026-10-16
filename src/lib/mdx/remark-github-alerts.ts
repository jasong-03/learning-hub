import type { Blockquote, Paragraph, Root, Text } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { visit } from 'unist-util-visit';

/**
 * GitHub alert syntax (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`,
 * `> [!CAUTION]`) -> <Admonition kind="..."> so imported GitHub Markdown keeps its callouts.
 * Spec: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
 */
export const ALERT_KINDS = ['note', 'tip', 'important', 'warning', 'caution'] as const;

// The marker must open the blockquote's first line, e.g. "[!WARNING]" optionally followed by a line break.
const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n)?/i;

export function remarkGithubAlerts() {
  return (tree: Root): void => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;
      const first = node.children[0];
      if (first?.type !== 'paragraph') return;
      const lead = (first as Paragraph).children[0];
      if (lead?.type !== 'text') return;
      const match = MARKER.exec((lead as Text).value);
      if (!match) return;

      (lead as Text).value = (lead as Text).value.slice(match[0].length);
      if ((lead as Text).value === '') (first as Paragraph).children.shift();
      // A marker on its own line leaves a leading line break node behind.
      if ((first as Paragraph).children[0]?.type === 'break') (first as Paragraph).children.shift();
      const children = (first as Paragraph).children.length === 0 ? node.children.slice(1) : node.children;

      const element: MdxJsxFlowElement = {
        type: 'mdxJsxFlowElement',
        name: 'Admonition',
        attributes: [{ type: 'mdxJsxAttribute', name: 'kind', value: match[1].toLowerCase() }],
        children: children as MdxJsxFlowElement['children'],
      };
      parent.children.splice(index, 1, element);
    });
  };
}
