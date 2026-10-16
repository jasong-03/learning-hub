import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

/** Every course is indexed; the course id (first slug) is the tag used by the search dialog's course filter. */
export const { GET } = createFromSource(source, {
  buildIndex(page) {
    return {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: page.slugs[0],
    };
  },
});
