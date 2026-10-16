import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { resolveLegacyRedirect } from '../src/config/legacy-redirects';
import type { Catalog } from '../src/domain/types';
import { createCatalogIndex } from '../src/lib/catalog-index';

/** V1 lesson index captured before the multi-course migration (tests/fixtures). */
interface V1Lesson {
  id: string;
  kind: 'note' | 'roadmap' | 'overview' | 'part' | 'lab';
  phase: string;
  title: string;
  url: string;
  checklist: string[];
  related: string[];
}

const root = path.resolve(import.meta.dirname, '..');
const v1 = (JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/kubernetes-v1-lessons.json'), 'utf8')) as { lessons: V1Lesson[] }).lessons;
const catalogFile = path.join(root, 'src/generated/catalog.json');
const index = createCatalogIndex(JSON.parse(fs.readFileSync(catalogFile, 'utf8')) as Catalog);
const V1_LABELS: Record<V1Lesson['kind'], string | undefined> = { note: 'Note', roadmap: 'Roadmap', overview: 'Overview', part: 'Guide', lab: undefined };

describe('Kubernetes course regression against V1', () => {
  it('has every V1 lesson and lab with the same title, module and label', () => {
    assert.equal(v1.length, 112);
    for (const old of v1) {
      const item = index.getItem(`kubernetes:${old.id}`);
      assert.ok(item, `missing ${old.id}`);
      assert.equal(item.title, old.title, old.id);
      assert.equal(item.moduleId, `kubernetes:${old.phase}`, old.id);
      assert.equal(item.kind, old.kind === 'lab' ? 'lab' : 'lesson', old.id);
      if (item.kind === 'lesson') assert.equal(item.label, V1_LABELS[old.kind], old.id);
    }
    assert.equal(index.courseItems('kubernetes').length, v1.length, 'no extra Kubernetes items');
  });

  it('keeps every lab checklist step (same anchors, same order)', () => {
    let steps = 0;
    for (const old of v1.filter((lesson) => lesson.kind === 'lab')) {
      const lab = index.getLab(`kubernetes:${old.id}`);
      assert.ok(lab);
      assert.deepEqual(lab.checklist.map((item) => item.anchor), old.checklist.map((id) => id.slice(id.indexOf(':') + 1)), old.id);
      steps += lab.checklist.length;
    }
    assert.equal(steps, 349);
  });

  it('keeps lesson <-> lab relations', () => {
    for (const old of v1) {
      const item = index.getItem(`kubernetes:${old.id}`)!;
      const related = item.kind === 'lab' ? item.relatedLessonIds : item.relatedLabIds;
      assert.deepEqual([...related].sort(), old.related.map((id) => `kubernetes:${id}`).sort(), old.id);
    }
    const note3 = index.getLesson('kubernetes:note-03')!;
    assert.deepEqual(note3.relatedLabIds, ['kubernetes:lab-06', 'kubernetes:lab-07']);
  });

  it('redirects every V1 URL to the new URL of the same item', () => {
    for (const old of v1) {
      const item = index.getItem(`kubernetes:${old.id}`)!;
      assert.equal(resolveLegacyRedirect(old.url), item.url, old.url);
    }
    assert.equal(resolveLegacyRedirect('/docs'), '/courses/kubernetes');
    assert.equal(resolveLegacyRedirect('/docs/labs'), '/courses/kubernetes/labs');
    assert.equal(resolveLegacyRedirect('/'), '/dashboard');
  });

  it('keeps the V1 quizzes attached to Notes #1 and #3', () => {
    assert.equal(index.getLesson('kubernetes:note-01')?.quizId, 'kubernetes:quiz-note-01');
    assert.equal(index.getLesson('kubernetes:note-03')?.quizId, 'kubernetes:quiz-note-03');
    assert.equal(index.getQuiz('kubernetes:quiz-note-03')?.questions.length, 5);
  });
});

describe('sample courses', () => {
  it('provides metadata for AWS, AI Engineering and English without lessons', () => {
    for (const id of ['aws', 'ai-engineering', 'english']) {
      const course = index.getCourse(id);
      assert.ok(course, id);
      assert.equal(course.status, 'planned');
      assert.ok(index.courseModules(id).length > 0);
      assert.equal(index.courseItems(id).length, 0);
    }
  });
});
