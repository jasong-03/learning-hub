import { llms, loader } from 'fumadocs-core/source';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';
import { coursesRoute } from './shared';

/**
 * Frontmatter fields read by the app. Full validation (required fields, ids,
 * module references) happens at build time in scripts/generate-content.ts
 * against src/domain/schema.ts; here they are optional so a single collection
 * can hold lessons, labs and course pages.
 */
const coursePageSchema = pageSchema.extend({
  type: z.enum(['lesson', 'lab', 'course-page']).optional(),
  id: z.string().optional(),
  module: z.string().optional(),
  label: z.string().optional(),
  lang: z.string().optional(),
});

const courses = defineDocs({
  dir: 'content/courses',
  docs: {
    schema: coursePageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

/** Pages resolve to /courses/<courseId>/learn/... and /courses/<courseId>/labs/... from their file paths. */
export const source = loader({
  baseUrl: coursesRoute,
  source: courses.toFumadocsSource(),
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
