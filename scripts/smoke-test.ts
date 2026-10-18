/**
 * HTTP smoke test against a running server (`pnpm build && pnpm start`, or `pnpm dev`).
 * Usage: BASE_URL=http://localhost:3000 pnpm test:smoke
 *
 * Checks: every hub, course, lesson and lab route returns 200; lab pages contain
 * their checklist anchors; every V1 /docs URL permanently redirects to the
 * same item's new URL; search works across courses, with a course filter,
 * and for Vietnamese text; unknown courses return 404; Markdown export works.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Catalog, QuestionBank } from '../src/domain/types';
import { CATALOG_JSON, QUESTION_BANKS_ROOT } from './lib/paths';

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const CONCURRENCY = 8;
const failures: string[] = [];
let checks = 0;

function expect(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) failures.push(message);
}

async function request(pathname: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${BASE_URL}${pathname}`, { redirect: 'manual', ...init });
  } catch (error) {
    throw new Error(`Cannot reach ${BASE_URL}${pathname}. Is the server running? (${error instanceof Error ? error.message : String(error)})`, { cause: error });
  }
}

async function inBatches<T>(items: T[], run: (item: T) => Promise<void>): Promise<void> {
  for (let start = 0; start < items.length; start += CONCURRENCY) {
    await Promise.all(items.slice(start, start + CONCURRENCY).map(run));
  }
}

async function checkPage(pathname: string, mustContain: string[] = []): Promise<void> {
  const response = await request(pathname);
  expect(response.status === 200, `${pathname}: expected 200, got ${response.status}`);
  if (response.status !== 200 || mustContain.length === 0) return;
  const html = await response.text();
  for (const fragment of mustContain) expect(html.includes(fragment), `${pathname}: missing ${fragment}`);
}

async function checkRedirect(from: string, to: string, status: number): Promise<void> {
  const response = await request(from);
  const location = response.headers.get('location') ?? '';
  const target = location.startsWith('http') ? new URL(location).pathname : location;
  expect(response.status === status && target === to, `${from}: expected ${status} -> ${to}, got ${response.status} -> ${location}`);
}

interface SearchItem {
  url?: string;
}

async function search(query: string, tag?: string): Promise<string[]> {
  const params = new URLSearchParams({ query });
  if (tag) params.set('tag', tag);
  const response = await request(`/api/search?${params.toString()}`);
  expect(response.status === 200, `search "${query}" (${tag ?? 'all'}): status ${response.status}`);
  const body = (await response.json()) as SearchItem[] | { items?: SearchItem[] };
  const items = Array.isArray(body) ? body : (body.items ?? []);
  return items.flatMap((item) => (item.url ? [item.url] : []));
}

async function main(): Promise<void> {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_JSON, 'utf8')) as Catalog;
  const fixture = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../tests/fixtures/kubernetes-v1-lessons.json'), 'utf8')) as {
    lessons: { id: string; kind: string; phase: string; url: string }[];
  };
  // V1 guide parts now live on their phase's single guide page.
  const currentId = (old: (typeof fixture.lessons)[number]): string => (old.kind === 'part' ? `${old.phase}-overview` : old.id);

  const hubRoutes = ['/dashboard', '/courses', '/paths', '/practice', '/review', '/analytics'];
  const courseRoutes = catalog.courses.flatMap((course) => [
    course.url,
    ...(course.labsUrl ? [course.labsUrl] : []),
    ...(course.questionsUrl ? [course.questionsUrl] : []),
  ]);
  const moduleRoutes = catalog.modules.map((learningModule) => `/courses/${learningModule.courseId}/modules/${learningModule.localId}`);
  await inBatches([...hubRoutes, ...courseRoutes, ...moduleRoutes, ...catalog.paths.map((learningPath) => learningPath.url)], (pathname) => checkPage(pathname));
  await inBatches(catalog.lessons, (lesson) => checkPage(lesson.url));
  await inBatches(catalog.labs, (lab) => checkPage(lab.url, lab.checklist.map((item) => `id="${item.anchor}"`)));
  await checkPage('/courses/kubernetes/learn/fundamentals/note-03-deployment', ['Tự kiểm tra: Deployment', '/courses/kubernetes/labs/lab-06-']);

  // AI Engineer Interview course: imported GitHub Markdown renders (reveals, alerts), questions are linked, attribution is visible.
  const ai = '/courses/ai-engineer-interview';
  await checkPage(`${ai}/learn/question-bank/fundamentals`, ['<details', 'Show answer']);
  // Every question's "View in lesson" anchor exists in the rendered lesson HTML.
  const anchorsByPage = new Map<string, string[]>();
  for (const bankFile of fs.readdirSync(QUESTION_BANKS_ROOT)) {
    const bank = JSON.parse(fs.readFileSync(path.join(QUESTION_BANKS_ROOT, bankFile), 'utf8')) as QuestionBank;
    for (const question of bank.questions) {
      const [pageUrl, anchor] = question.contextUrl.split('#');
      anchorsByPage.set(pageUrl, [...(anchorsByPage.get(pageUrl) ?? []), `id="${anchor}"`]);
    }
  }
  await inBatches([...anchorsByPage], ([pageUrl, anchors]) => checkPage(pageUrl, anchors));
  await checkPage(`${ai}/learn/rag/rag`, ['role="note"', 'Practice questions', `${ai}/questions?mode=practice&amp;set=ai-engineer-interview%3Aqset-rag`]);
  await checkPage(ai, ['Interview practice', 'awesome-ai-engineer-interview', '5d10bbd25263', 'MIT', 'Full license text']);
  await checkPage(`${ai}/learn/study-plans-resources/source-and-license`, ['Permission is hereby granted', 'Landed (b100x)']);
  // The bank reads its filters from the URL, so it renders client-side; the browser test covers its content.
  await checkPage(`${ai}/questions`, ['Question bank', 'Loading questions']);
  await checkPage('/review', ['Questions to review']);
  await checkPage('/practice', ['Question banks', 'AI Engineer Interview Preparation']);
  const aiSearch = await search('KV cache', 'ai-engineer-interview');
  expect(aiSearch.length > 0 && aiSearch.every((url) => url.startsWith(`${ai}/`)), 'search "KV cache" filtered to the AI course returned nothing or other courses');
  const crossSearch = await search('Kubernetes');
  expect(crossSearch.some((url) => url.startsWith('/courses/kubernetes/')), 'unfiltered search misses Kubernetes after adding the AI course');
  const ragOnlyAi = await search('reranking', 'kubernetes');
  expect(ragOnlyAi.every((url) => url.startsWith('/courses/kubernetes/')), 'Kubernetes-filtered search leaked AI course results');

  const unknown = await request('/courses/does-not-exist');
  expect(unknown.status === 404, `/courses/does-not-exist: expected 404, got ${unknown.status}`);

  await checkRedirect('/', '/dashboard', 307);
  const itemUrl = new Map([...catalog.lessons, ...catalog.labs].map((item) => [item.id, item.url]));
  await inBatches(fixture.lessons, (old) => checkRedirect(old.url, itemUrl.get(`kubernetes:${currentId(old)}`) ?? '(missing)', 308));
  await checkRedirect('/docs', '/courses/kubernetes', 308);
  await checkRedirect('/docs/labs', '/courses/kubernetes/labs', 308);
  await checkRedirect('/courses/kubernetes/learn/application-deployment/part-03-health-probes', '/courses/kubernetes/learn/application-deployment/overview', 308);

  const all = await search('maxSurge');
  expect(all.some((url) => url.startsWith('/courses/kubernetes/learn/fundamentals/note-03-deployment')), 'search "maxSurge" does not find Note #3');
  const scoped = await search('Deployment', 'kubernetes');
  expect(scoped.length > 0 && scoped.every((url) => url.startsWith('/courses/kubernetes/')), 'course-filtered search returned other courses');
  const otherCourse = await search('Deployment', 'aws');
  expect(otherCourse.length === 0, `search filtered to "aws" returned ${otherCourse.length} Kubernetes results`);
  const vietnamese = await search('khỏe');
  expect(vietnamese.some((url) => url.includes('/application-deployment/overview')), 'Vietnamese search "khỏe" misses the health probes guide');
  const labs = await search('etcd');
  expect(labs.some((url) => url.startsWith('/courses/kubernetes/labs/lab-45-')), 'search "etcd" misses Lab 45');

  const markdown = await request('/courses/kubernetes/learn/fundamentals/note-03-deployment.md');
  expect(markdown.status === 200 && (markdown.headers.get('content-type') ?? '').includes('markdown'), 'Markdown export of Note #3 failed');

  if (failures.length > 0) {
    console.error(`[smoke] ${failures.length}/${checks} checks failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`[smoke] OK: ${checks} checks against ${BASE_URL}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
