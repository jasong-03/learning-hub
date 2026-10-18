import type { CourseStatus, CourseUpstream, Difficulty, LearningPathItem, Level, QuestionFile, QuestionFormat } from './schema';

/** Shapes of the generated catalog (src/generated/catalog.json). All ids are global. */

export interface Category {
  id: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  level: Level;
  language: string;
  status: CourseStatus;
  icon: string;
  tags: string[];
  url: string;
  moduleIds: string[];
  /** Present when the course has a labs index page. */
  labsUrl?: string;
  /** Present when the course has question sets. */
  questionsUrl?: string;
  source?: CourseSource;
}

export interface CourseSource {
  name: string;
  url: string;
  license: string;
  licenseHolder: string;
  licenseUrl?: string;
  upstream?: CourseUpstream;
}

export interface Module {
  id: string;
  localId: string;
  courseId: string;
  title: string;
  description: string;
  icon?: string;
  lessonIds: string[];
  labIds: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  anchor: string;
}

export interface Lesson {
  id: string;
  localId: string;
  courseId: string;
  moduleId: string;
  title: string;
  /** Short name for navigation and lists, when the title is long or repetitive. */
  navTitle?: string;
  url: string;
  order: number;
  label?: string;
  lang?: string;
  relatedLabIds: string[];
  quizId?: string;
  source?: string;
}

export interface Lab {
  id: string;
  localId: string;
  courseId: string;
  moduleId: string;
  title: string;
  url: string;
  order: number;
  number?: number;
  lang?: string;
  checklist: ChecklistItem[];
  relatedLessonIds: string[];
  source?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

/** Catalog-level summary of a question set; the questions themselves live in src/generated/question-banks/. */
export interface QuestionSetSummary {
  id: string;
  courseId: string;
  topic: string;
  lessonId: string;
  relatedLessonIds: string[];
  questionIds: string[];
  counts: { total: number; multipleChoice: number; openEnded: number } & Partial<Record<Difficulty, number>>;
}

export interface Question extends Omit<QuestionFile, 'id'> {
  id: string;
  courseId: string;
  setId: string;
  topic: string;
  lessonId: string;
  /** Lesson URL + anchor where the question appears in context. */
  contextUrl: string;
  format: QuestionFormat;
}

export interface QuestionBank {
  courseId: string;
  questions: Question[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  items: LearningPathItem[];
  url: string;
}

export interface Catalog {
  categories: Category[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  labs: Lab[];
  quizzes: Quiz[];
  questionSets: QuestionSetSummary[];
  paths: LearningPath[];
}

/** A lesson or lab: anything a learner can complete. */
export type LearningItem = ({ kind: 'lesson' } & Lesson) | ({ kind: 'lab' } & Lab);
