/**
 * Content build: validates every course manifest, runs course importers
 * (currently Kubernetes from ../progress), then writes the global catalog
 * to src/generated/catalog.json. Fails on any schema or reference problem.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { CourseManifest } from '../src/domain/schema';
import { importAiEngineerInterviewCourse } from './importers/ai-engineer-interview';
import { importKubernetesCourse } from './importers/kubernetes-progress';
import { refreshNotesSnapshot } from './importers/kubernetes-snapshot';
import { CatalogError, buildCatalog, loadCourseManifests } from './lib/catalog-builder';
import { CATALOG_JSON, COURSES_ROOT, GENERATED_ROOT, QUESTION_BANKS_ROOT } from './lib/paths';

/**
 * Folder titles for Fumadocs' filesystem tree, derived from course.json. The
 * sidebars are built from the catalog, so these only label search-result
 * breadcrumbs ("Kubernetes: Zero to Production > Fundamentals" instead of folder names).
 */
function writeFolderTitles(course: CourseManifest): void {
  const courseRoot = path.join(COURSES_ROOT, course.id);
  const titles: [string, string][] = [
    [courseRoot, course.title],
    [path.join(courseRoot, 'learn'), 'Lessons'],
    [path.join(courseRoot, 'labs'), 'Labs'],
    ...course.modules.map((module): [string, string] => [path.join(courseRoot, 'learn', module.id), module.title]),
  ];
  for (const [directory, title] of titles) {
    if (fs.existsSync(directory)) fs.writeFileSync(path.join(directory, 'meta.json'), `${JSON.stringify({ title }, null, 2)}\n`);
  }
}

function runImporters(): void {
  const problems: string[] = [];
  const manifests = loadCourseManifests(problems);
  if (problems.length > 0) throw new CatalogError(problems);
  for (const course of manifests) {
    if (course.importer === 'kubernetes-progress') {
      console.log(refreshNotesSnapshot() ? '[generate] refreshed vendor/kubernetes-progress from ../progress' : '[generate] ../progress not found; using the committed notes snapshot');
      const report = importKubernetesCourse(course);
      console.log(
        `[generate] imported ${course.id}: ${report.sources} sources -> ${report.lessons} lessons, ${report.labs} labs, ` +
          `${report.imagesCopied.length} images`,
      );
    }
    if (course.importer === 'ai-engineer-interview') {
      const report = importAiEngineerInterviewCourse(course);
      console.log(
        `[generate] imported ${course.id}: ${report.lessons} lessons, ${report.questionSets} question sets ` +
          `(${report.multipleChoice} multiple-choice, ${report.openEnded} open-ended), links ${JSON.stringify(report.linksRewritten)}`,
      );
    }
    writeFolderTitles(course);
  }
}

function main(): void {
  runImporters();
  const { catalog, questionBanks } = buildCatalog();
  fs.mkdirSync(GENERATED_ROOT, { recursive: true });
  fs.writeFileSync(CATALOG_JSON, `${JSON.stringify(catalog, null, 2)}\n`);
  fs.rmSync(QUESTION_BANKS_ROOT, { recursive: true, force: true });
  fs.mkdirSync(QUESTION_BANKS_ROOT, { recursive: true });
  for (const bank of questionBanks) fs.writeFileSync(`${QUESTION_BANKS_ROOT}/${bank.courseId}.json`, `${JSON.stringify(bank, null, 2)}\n`);
  console.log(
    `[generate] catalog: ${catalog.categories.length} categories, ${catalog.courses.length} courses, ` +
      `${catalog.modules.length} modules, ${catalog.lessons.length} lessons, ${catalog.labs.length} labs, ` +
      `${catalog.quizzes.length} quizzes, ${catalog.questionSets.length} question sets ` +
      `(${questionBanks.reduce((sum, bank) => sum + bank.questions.length, 0)} questions), ${catalog.paths.length} paths`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
