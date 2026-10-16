import { createGetUrl } from 'fumadocs-core/source';
import { REPOSITORY, SITE_NAME } from '@/config/site';

export const appName = SITE_NAME;
export const coursesRoute = '/courses';
export const coursesContentRoute = '/llms.mdx/courses';

export const gitConfig = {
  user: REPOSITORY.owner,
  repo: REPOSITORY.name,
  branch: REPOSITORY.branch,
};

const getContentUrl = createGetUrl(coursesContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}
