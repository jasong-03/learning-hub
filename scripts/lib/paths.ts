import path from 'node:path';

export const APP_ROOT = path.resolve(import.meta.dirname, '../..');
export const REPO_ROOT = path.resolve(APP_ROOT, '..');
export const CONTENT_ROOT = path.join(APP_ROOT, 'content');
export const COURSES_ROOT = path.join(CONTENT_ROOT, 'courses');
export const PATHS_ROOT = path.join(CONTENT_ROOT, 'paths');
export const CATEGORIES_FILE = path.join(CONTENT_ROOT, 'categories.json');
export const PUBLIC_ROOT = path.join(APP_ROOT, 'public');
export const ASSETS_ROOT = path.join(PUBLIC_ROOT, 'content-assets');
export const ASSETS_URL = '/content-assets';
export const GENERATED_ROOT = path.join(APP_ROOT, 'src/generated');
export const CATALOG_JSON = path.join(GENERATED_ROOT, 'catalog.json');
export const QUESTION_BANKS_ROOT = path.join(GENERATED_ROOT, 'question-banks');

export const COURSES_URL = '/courses';
export const PATHS_URL = '/paths';

export const courseUrl = (courseId: string): string => `${COURSES_URL}/${courseId}`;
export const labsIndexUrl = (courseId: string): string => `${courseUrl(courseId)}/labs`;
export const questionsUrl = (courseId: string): string => `${courseUrl(courseId)}/questions`;

/** Public URL of a content file under content/courses (mirrors the Fumadocs loader with baseUrl /courses). */
export function contentFileUrl(absoluteFile: string): string {
  const segments = path.relative(COURSES_ROOT, absoluteFile).replace(/\.mdx?$/, '').split(path.sep);
  if (segments[segments.length - 1] === 'index') segments.pop();
  return [COURSES_URL, ...segments].join('/');
}
