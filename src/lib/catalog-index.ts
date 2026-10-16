import type { Catalog, Category, Course, Lab, LearningItem, LearningPath, Lesson, Module, QuestionSetSummary, Quiz } from '@/domain/types';
import type { KnownIds } from '@/lib/progress/model';

/** Read-only lookups over the generated catalog. Pure, so tests can build one from fixtures. */
export interface CatalogIndex {
  data: Catalog;
  getCategory(id: string): Category | undefined;
  getCourse(id: string): Course | undefined;
  getModule(id: string): Module | undefined;
  getLesson(id: string): Lesson | undefined;
  getLab(id: string): Lab | undefined;
  getQuiz(id: string): Quiz | undefined;
  getPath(id: string): LearningPath | undefined;
  getQuestionSet(id: string): QuestionSetSummary | undefined;
  courseQuestionSets(courseId: string): QuestionSetSummary[];
  /** Question sets that practice a lesson: the set shown on it, or sets listing it as related. */
  lessonQuestionSets(lessonId: string): QuestionSetSummary[];
  getItem(id: string): LearningItem | undefined;
  courseModules(courseId: string): Module[];
  /** Lessons then labs of a module, each in authored order. */
  moduleItems(moduleId: string): LearningItem[];
  /** All items of a course in module order. */
  courseItems(courseId: string): LearningItem[];
  /** De-duplicated items covered by a path, in path order. */
  pathItems(pathId: string): LearningItem[];
  knownIds: KnownIds;
}

export function createCatalogIndex(data: Catalog): CatalogIndex {
  const byId = <T extends { id: string }>(items: T[]): Map<string, T> => new Map(items.map((item) => [item.id, item]));
  const categories = byId(data.categories);
  const courses = byId(data.courses);
  const modules = byId(data.modules);
  const lessons = byId(data.lessons);
  const labs = byId(data.labs);
  const quizzes = byId(data.quizzes);
  const paths = byId(data.paths);
  const questionSets = byId(data.questionSets);

  const getItem = (id: string): LearningItem | undefined => {
    const lesson = lessons.get(id);
    if (lesson) return { kind: 'lesson', ...lesson };
    const lab = labs.get(id);
    return lab ? { kind: 'lab', ...lab } : undefined;
  };
  const moduleItems = (moduleId: string): LearningItem[] => {
    const learningModule = modules.get(moduleId);
    if (!learningModule) return [];
    return [...learningModule.lessonIds, ...learningModule.labIds].flatMap((id) => getItem(id) ?? []);
  };
  const courseModules = (courseId: string): Module[] =>
    (courses.get(courseId)?.moduleIds ?? []).flatMap((id) => modules.get(id) ?? []);
  const courseItems = (courseId: string): LearningItem[] => courseModules(courseId).flatMap((learningModule) => moduleItems(learningModule.id));

  return {
    data,
    getCategory: (id) => categories.get(id),
    getCourse: (id) => courses.get(id),
    getModule: (id) => modules.get(id),
    getLesson: (id) => lessons.get(id),
    getLab: (id) => labs.get(id),
    getQuiz: (id) => quizzes.get(id),
    getPath: (id) => paths.get(id),
    getQuestionSet: (id) => questionSets.get(id),
    courseQuestionSets: (courseId) => data.questionSets.filter((set) => set.courseId === courseId),
    lessonQuestionSets: (lessonId) => data.questionSets.filter((set) => set.lessonId === lessonId || set.relatedLessonIds.includes(lessonId)),
    getItem,
    courseModules,
    moduleItems,
    courseItems,
    pathItems(pathId) {
      const learningPath = paths.get(pathId);
      if (!learningPath) return [];
      const seen = new Set<string>();
      return learningPath.items
        .flatMap((item) => (item.type === 'course' ? courseItems(item.courseId) : moduleItems(`${item.courseId}:${item.moduleId}`)))
        .filter((item) => !seen.has(item.id) && seen.add(item.id));
    },
    knownIds: {
      items: new Set([...lessons.keys(), ...labs.keys()]),
      checklistItems: new Set(data.labs.flatMap((lab) => lab.checklist.map((item) => item.id))),
      quizzes: new Set(quizzes.keys()),
      questions: new Set(data.questionSets.flatMap((set) => set.questionIds)),
    },
  };
}
