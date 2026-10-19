import type { List, Root } from 'mdast';
import { visit } from 'unist-util-visit';

export const IMAGE_CARDS_CLASS = 'image-cards';

/**
 * A list whose every item opens with a paragraph holding only an image renders
 * as a card grid (image on top, the rest of the item as caption):
 *
 *   - ![HPA](image/hpa.jpg)
 *
 *     **HPA — Quản lý tăng nhân sự**
 *
 *     Khi tải tăng, HPA tăng số Pod replicas.
 *
 * Plain Markdown, so the same source still reads as a list on GitHub.
 */
export function remarkImageCards() {
  return (tree: Root): void => {
    visit(tree, 'list', (node: List) => {
      if (node.ordered || node.children.length === 0) return;
      const isCardList = node.children.every((item) => {
        const first = item.children[0];
        if (first?.type !== 'paragraph') return false;
        const content = first.children.filter((child) => !(child.type === 'text' && child.value.trim() === ''));
        return content.length === 1 && content[0].type === 'image';
      });
      if (!isCardList) return;
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, className: [IMAGE_CARDS_CLASS] } };
    });
  };
}
