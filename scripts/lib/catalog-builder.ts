/**
 * Builds the global catalog from authored metadata (categories, course.json,
 * quizzes, paths) and the lesson/lab Markdown under content/courses.
 * Collects every validation problem before failing, so one run reports all of them.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import {
  categoriesFileSchema,
  checklistItemId,
  contentFrontmatterSchema,
  courseManifestSchema,
  courseUpstreamSchema,
  learningPathSchema,
  questionSetFileSchema,
  quizFileSchema,
  toGlobalId,
  type CourseManifest,
  type LabFrontmatter,
  type LessonFrontmatter,
} from '../../src/domain/schema';
import type { Catalog, ChecklistItem, Course, CourseSource, Lab, Lesson, Module, Question, QuestionBank, QuestionSetSummary, Quiz } from '../../src/domain/types';
import { analyzeMarkdown, type HeadingInfo } from './markdown-ast';
import { CATEGORIES_FILE, COURSES_ROOT, PATHS_ROOT, PATHS_URL, contentFileUrl, courseUrl, labsIndexUrl, questionsUrl } from './paths';

export class CatalogError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Catalog validation failed with ${problems.length} problem(s):\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  }
}

export function readJson<T>(file: string, schema: z.ZodType<T>, problems: string[]): T | null {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    problems.push(`${relative(file)}: cannot read JSON (${error instanceof Error ? error.message : String(error)})`);
    return null;
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) problems.push(`${relative(file)}: ${issue.path.join('.') || '(root)'} ${issue.message}`);
    return null;
  }
  return result.data;
}

function relative(file: string): string {
  return path.relative(path.resolve(COURSES_ROOT, '../..'), file);
}

export function listFiles(directory: string, pattern: RegExp): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute, pattern);
    return pattern.test(entry.name) ? [absolute] : [];
  });
}

export function loadCourseManifests(problems: string[]): CourseManifest[] {
  const courses: CourseManifest[] = [];
  for (const entry of fs.readdirSync(COURSES_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(COURSES_ROOT, entry.name, 'course.json');
    if (!fs.existsSync(file)) {
      problems.push(`content/courses/${entry.name}: missing course.json`);
      continue;
    }
    const course = readJson(file, courseManifestSchema, problems);
    if (!course) continue;
    if (course.id !== entry.name) problems.push(`${relative(file)}: id "${course.id}" must equal its folder name "${entry.name}"`);
    courses.push(course);
  }
  return courses;
}

/**
 * Lab steps a learner ticks off: "Step N" / "Part X" headings at the lab's section
 * level, else the sub-headings of a "Steps" section, plus Verification and Cleanup.
 */
export function buildChecklist(labGlobalId: string, headings: HeadingInfo[]): ChecklistItem[] {
  const sectionDepth = Math.min(...headings.map((heading) => heading.depth), 6);
  const isSection = (heading: HeadingInfo): boolean => heading.depth === sectionDepth;
  let items = headings.filter((heading) => isSection(heading) && /^(Step\s+\d+|Part\s+[A-Z0-9]+\b)/i.test(heading.text));
  if (items.length === 0) {
    const stepsIndex = headings.findIndex((heading) => isSection(heading) && heading.text.trim() === 'Steps');
    if (stepsIndex !== -1) {
      const after = headings.slice(stepsIndex + 1);
      const end = after.findIndex((heading) => heading.depth <= sectionDepth);
      items = (end === -1 ? after : after.slice(0, end)).filter((heading) => heading.depth === sectionDepth + 1);
    }
  }
  const extras = headings.filter((heading) => isSection(heading) && ['Verification', 'Cleanup'].includes(heading.text.trim()));
  return [...items, ...extras].map((heading) => ({
    id: checklistItemId(labGlobalId, heading.id),
    label: heading.text,
    anchor: heading.id,
  }));
}

interface CourseContent {
  lessons: Lesson[];
  labs: Lab[];
  hasLabsIndexPage: boolean;
  /** Local lesson id -> local related lab ids, resolved after all labs are known. */
  relatedLabs: Map<string, string[]>;
}

function loadCourseContent(course: CourseManifest, problems: string[]): CourseContent {
  const courseRoot = path.join(COURSES_ROOT, course.id);
  const moduleIds = new Set(course.modules.map((module) => module.id));
  const content: CourseContent = { lessons: [], labs: [], hasLabsIndexPage: false, relatedLabs: new Map() };
  const files = [
    ...listFiles(path.join(courseRoot, 'learn'), /\.mdx?$/),
    ...listFiles(path.join(courseRoot, 'labs'), /\.mdx?$/),
  ];

  for (const file of files) {
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const result = contentFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      for (const issue of result.error.issues) problems.push(`${relative(file)}: frontmatter ${issue.path.join('.')} ${issue.message}`);
      continue;
    }
    const data = result.data;
    const url = contentFileUrl(file);
    const isUnderLabs = file.startsWith(path.join(courseRoot, 'labs') + path.sep);
    if (data.type === 'course-page') {
      if (url === labsIndexUrl(course.id)) content.hasLabsIndexPage = true;
      else problems.push(`${relative(file)}: course pages are only supported at labs/index.md`);
      continue;
    }
    if (!moduleIds.has(data.module)) {
      problems.push(`${relative(file)}: module "${data.module}" is not declared in course.json`);
      continue;
    }
    if (data.type === 'lab') {
      if (!isUnderLabs) problems.push(`${relative(file)}: labs must live in labs/`);
      content.labs.push(toLab(course, data, url, parsed.content));
    } else {
      if (isUnderLabs) problems.push(`${relative(file)}: lessons must live in learn/`);
      content.lessons.push(toLesson(course, data, url));
      content.relatedLabs.set(data.id, data.relatedLabs);
    }
  }
  return content;
}

function toLesson(course: CourseManifest, data: LessonFrontmatter, url: string): Lesson {
  return {
    id: toGlobalId(course.id, data.id),
    localId: data.id,
    courseId: course.id,
    moduleId: toGlobalId(course.id, data.module),
    title: data.title,
    url,
    order: data.order,
    label: data.label,
    lang: data.lang ?? course.language,
    relatedLabIds: [],
    source: data.source,
  };
}

function toLab(course: CourseManifest, data: LabFrontmatter, url: string, body: string): Lab {
  const id = toGlobalId(course.id, data.id);
  return {
    id,
    localId: data.id,
    courseId: course.id,
    moduleId: toGlobalId(course.id, data.module),
    title: data.title,
    url,
    order: data.order,
    number: data.number,
    lang: data.lang ?? course.language,
    checklist: buildChecklist(id, analyzeMarkdown(body).headings),
    relatedLessonIds: [],
    source: data.source,
  };
}

function byOrder<T extends { order: number; title: string }>(a: T, b: T): number {
  return a.order - b.order || a.title.localeCompare(b.title);
}

function loadQuizzes(course: CourseManifest, problems: string[]): Quiz[] {
  return listFiles(path.join(COURSES_ROOT, course.id, 'quizzes'), /\.json$/).flatMap((file) => {
    const quiz = readJson(file, quizFileSchema, problems);
    if (!quiz) return [];
    for (const question of quiz.questions) {
      const optionIds = new Set(question.options.map((option) => option.id));
      if (optionIds.size !== question.options.length) problems.push(`${relative(file)}: question "${question.id}" has duplicate option ids`);
      for (const id of question.correctOptionIds) {
        if (!optionIds.has(id)) problems.push(`${relative(file)}: question "${question.id}" marks unknown option "${id}" as correct`);
      }
    }
    const questionIds = new Set(quiz.questions.map((question) => question.id));
    if (questionIds.size !== quiz.questions.length) problems.push(`${relative(file)}: duplicate question ids`);
    return [{ ...quiz, id: toGlobalId(course.id, quiz.id), courseId: course.id, lessonId: toGlobalId(course.id, quiz.lessonId) }];
  });
}

function loadQuestionSets(
  course: CourseManifest,
  lessonsById: Map<string, Lesson>,
  problems: string[],
): { summaries: QuestionSetSummary[]; questions: Question[] } {
  const summaries: QuestionSetSummary[] = [];
  const questions: Question[] = [];
  for (const file of listFiles(path.join(COURSES_ROOT, course.id, 'questions'), /\.json$/)) {
    const set = readJson(file, questionSetFileSchema, problems);
    if (!set) continue;
    const lesson = lessonsById.get(toGlobalId(course.id, set.lessonId));
    if (!lesson) {
      problems.push(`${relative(file)}: lessonId "${set.lessonId}" is not a lesson of ${course.id}`);
      continue;
    }
    for (const relatedId of set.relatedLessonIds) {
      if (!lessonsById.has(toGlobalId(course.id, relatedId))) problems.push(`${relative(file)}: related lesson "${relatedId}" does not exist`);
    }
    const setId = toGlobalId(course.id, set.id);
    const setQuestions = set.questions.map((question): Question => {
      if (question.format === 'multiple-choice' && !question.options?.some((option) => option.isCorrect)) {
        problems.push(`${relative(file)}: ${question.id} has no correct option`);
      }
      if (question.format === 'open-ended' && !question.answerHtml) problems.push(`${relative(file)}: ${question.id} has no answer`);
      return { ...question, id: toGlobalId(course.id, question.id), courseId: course.id, setId, topic: set.topic, lessonId: lesson.id, contextUrl: `${lesson.url}#${question.anchor}` };
    });
    const count = (predicate: (question: Question) => boolean): number => setQuestions.filter(predicate).length;
    summaries.push({
      id: setId,
      courseId: course.id,
      topic: set.topic,
      lessonId: lesson.id,
      relatedLessonIds: set.relatedLessonIds.map((id) => toGlobalId(course.id, id)),
      questionIds: setQuestions.map((question) => question.id),
      counts: {
        total: setQuestions.length,
        multipleChoice: count((question) => question.format === 'multiple-choice'),
        openEnded: count((question) => question.format === 'open-ended'),
        easy: count((question) => question.difficulty === 'easy'),
        medium: count((question) => question.difficulty === 'medium'),
        hard: count((question) => question.difficulty === 'hard'),
      },
    });
    questions.push(...setQuestions);
  }
  return { summaries, questions };
}

function courseSource(course: CourseManifest, lessonsById: Map<string, Lesson>, problems: string[]): CourseSource | undefined {
  if (!course.source) return undefined;
  const upstreamFile = path.join(COURSES_ROOT, course.id, 'upstream.json');
  const upstream = fs.existsSync(upstreamFile) ? readJson(upstreamFile, courseUpstreamSchema, problems) ?? undefined : undefined;
  const { licenseLessonId, ...rest } = course.source;
  const licenseLesson = licenseLessonId ? lessonsById.get(toGlobalId(course.id, licenseLessonId)) : undefined;
  if (licenseLessonId && !licenseLesson) problems.push(`Course "${course.id}": licenseLessonId "${licenseLessonId}" does not exist`);
  return { ...rest, licenseUrl: licenseLesson?.url, upstream };
}

function assertUnique(kind: string, ids: string[], problems: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) problems.push(`Duplicate ${kind} id "${id}"`);
    seen.add(id);
  }
}

function linkRelations(lessons: Lesson[], labs: Lab[], related: Map<string, string[]>, courseId: string, problems: string[]): void {
  const labsById = new Map(labs.map((lab) => [lab.id, lab]));
  for (const lesson of lessons) {
    for (const localLabId of related.get(lesson.localId) ?? []) {
      const lab = labsById.get(toGlobalId(courseId, localLabId));
      if (!lab) {
        problems.push(`${lesson.id}: relatedLabs references unknown lab "${localLabId}"`);
        continue;
      }
      lesson.relatedLabIds.push(lab.id);
      lab.relatedLessonIds.push(lesson.id);
    }
  }
}

export interface BuildResult {
  catalog: Catalog;
  questionBanks: QuestionBank[];
}

export function buildCatalog(): BuildResult {
  const problems: string[] = [];
  const categoriesFile = readJson(CATEGORIES_FILE, categoriesFileSchema, problems);
  const categories = categoriesFile?.categories ?? [];
  const categoryIds = new Set(categories.map((category) => category.id));
  const manifests = loadCourseManifests(problems);

  const catalog: Catalog = { categories, courses: [], modules: [], lessons: [], labs: [], quizzes: [], questionSets: [], paths: [] };
  const questionBanks: QuestionBank[] = [];
  for (const manifest of manifests) {
    if (!categoryIds.has(manifest.categoryId)) problems.push(`Course "${manifest.id}" uses unknown category "${manifest.categoryId}"`);
    const content = loadCourseContent(manifest, problems);
    const quizzes = loadQuizzes(manifest, problems);
    content.lessons.sort(byOrder);
    content.labs.sort(byOrder);
    linkRelations(content.lessons, content.labs, content.relatedLabs, manifest.id, problems);

    const lessonsById = new Map(content.lessons.map((lesson) => [lesson.id, lesson]));
    for (const quiz of quizzes) {
      const lesson = lessonsById.get(quiz.lessonId);
      if (!lesson) problems.push(`Quiz ${quiz.id} targets unknown lesson ${quiz.lessonId}`);
      else if (lesson.quizId) problems.push(`Lesson ${lesson.id} has more than one quiz`);
      else lesson.quizId = quiz.id;
    }

    const { summaries: questionSets, questions } = loadQuestionSets(manifest, lessonsById, problems);
    // Present sets in course order (module, then lesson), not file-name order.
    const lessonRank = (lessonId: string): number => {
      const lesson = lessonsById.get(lessonId);
      const moduleIndex = manifest.modules.findIndex((module) => toGlobalId(manifest.id, module.id) === lesson?.moduleId);
      return moduleIndex * 10_000 + (lesson?.order ?? 0);
    };
    questionSets.sort((a, b) => lessonRank(a.lessonId) - lessonRank(b.lessonId));
    const setRank = new Map(questionSets.map((set, index) => [set.id, index]));
    questions.sort((a, b) => (setRank.get(a.setId) ?? 0) - (setRank.get(b.setId) ?? 0));

    // Modules, lessons, labs, quizzes, question sets and questions share one id namespace per course.
    assertUnique(`course-scoped (${manifest.id})`, [
      ...manifest.modules.map((module) => toGlobalId(manifest.id, module.id)),
      ...content.lessons.map((lesson) => lesson.id),
      ...content.labs.map((lab) => lab.id),
      ...quizzes.map((quiz) => quiz.id),
      ...questionSets.map((set) => set.id),
      ...questions.map((question) => question.id),
    ], problems);

    const modules: Module[] = manifest.modules.map((module) => {
      const id = toGlobalId(manifest.id, module.id);
      return {
        id,
        localId: module.id,
        courseId: manifest.id,
        title: module.title,
        description: module.description,
        icon: module.icon,
        lessonIds: content.lessons.filter((lesson) => lesson.moduleId === id).map((lesson) => lesson.id),
        labIds: content.labs.filter((lab) => lab.moduleId === id).map((lab) => lab.id),
      };
    });
    if (manifest.status === 'active' && content.lessons.length + content.labs.length === 0) {
      problems.push(`Course "${manifest.id}" is active but has no lessons or labs`);
    }

    const course: Course = {
      id: manifest.id,
      title: manifest.title,
      description: manifest.description,
      categoryId: manifest.categoryId,
      level: manifest.level,
      language: manifest.language,
      status: manifest.status,
      icon: manifest.icon,
      tags: manifest.tags,
      url: courseUrl(manifest.id),
      moduleIds: modules.map((module) => module.id),
      labsUrl: content.labs.length > 0 || content.hasLabsIndexPage ? labsIndexUrl(manifest.id) : undefined,
      questionsUrl: questionSets.length > 0 ? questionsUrl(manifest.id) : undefined,
      source: courseSource(manifest, lessonsById, problems),
    };
    catalog.courses.push(course);
    catalog.modules.push(...modules);
    catalog.lessons.push(...content.lessons);
    catalog.labs.push(...content.labs);
    catalog.quizzes.push(...quizzes);
    catalog.questionSets.push(...questionSets);
    if (questions.length > 0) questionBanks.push({ courseId: manifest.id, questions });
  }

  const moduleIds = new Set(catalog.modules.map((module) => module.id));
  const courseIds = new Set(catalog.courses.map((course) => course.id));
  for (const file of listFiles(PATHS_ROOT, /\.json$/)) {
    const learningPath = readJson(file, learningPathSchema, problems);
    if (!learningPath) continue;
    if (path.basename(file, '.json') !== learningPath.id) problems.push(`${relative(file)}: file name must equal id "${learningPath.id}"`);
    for (const item of learningPath.items) {
      if (!courseIds.has(item.courseId)) problems.push(`Path ${learningPath.id} references unknown course "${item.courseId}"`);
      if (item.type === 'module' && !moduleIds.has(toGlobalId(item.courseId, item.moduleId))) {
        problems.push(`Path ${learningPath.id} references unknown module "${item.courseId}:${item.moduleId}"`);
      }
    }
    catalog.paths.push({ ...learningPath, url: `${PATHS_URL}/${learningPath.id}` });
  }

  assertUnique('category', catalog.categories.map((category) => category.id), problems);
  assertUnique('course', catalog.courses.map((course) => course.id), problems);
  assertUnique('learning path', catalog.paths.map((learningPath) => learningPath.id), problems);
  assertUnique('URL', [...catalog.lessons, ...catalog.labs].map((item) => item.url.toLowerCase()), problems);

  if (problems.length > 0) throw new CatalogError(problems);
  catalog.courses.sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active') || a.title.localeCompare(b.title));
  catalog.paths.sort((a, b) => a.title.localeCompare(b.title));
  return { catalog, questionBanks };
}
