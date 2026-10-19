import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { List, ListItem, Root } from 'mdast';
import { IMAGE_CARDS_CLASS, remarkImageCards } from '../src/lib/mdx/remark-image-cards';

function item(...children: ListItem['children']): ListItem {
  return { type: 'listItem', spread: true, children };
}
const image = (url: string): ListItem['children'][number] => ({ type: 'paragraph', children: [{ type: 'image', url, alt: url }] });
const text = (value: string): ListItem['children'][number] => ({ type: 'paragraph', children: [{ type: 'text', value }] });

function run(...items: ListItem[]): List {
  const list: List = { type: 'list', ordered: false, spread: true, children: items };
  remarkImageCards()({ type: 'root', children: [list] } as Root);
  return list;
}

describe('remarkImageCards', () => {
  it('marks a list whose items all open with an image as a card grid', () => {
    const list = run(item(image('a.jpg'), text('A')), item(image('b.jpg'), text('B')));
    assert.deepEqual(list.data?.hProperties?.className, [IMAGE_CARDS_CLASS]);
  });

  it('leaves mixed lists and image-with-text paragraphs alone', () => {
    assert.equal(run(item(image('a.jpg')), item(text('plain'))).data, undefined);
    const inline: ListItem = item({ type: 'paragraph', children: [{ type: 'image', url: 'a.jpg', alt: '' }, { type: 'text', value: ' caption' }] });
    assert.equal(run(inline).data, undefined);
  });
});
