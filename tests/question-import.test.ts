import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { countQuestionHeadings, parseQuestionFile } from '../scripts/importers/markdown-question-parser';
import { inlineMarkdownToHtml, markdownToHtml } from '../scripts/lib/markdown-html';
import { findRawHtmlViolations } from '../scripts/lib/raw-html-policy';
import type { Catalog, QuestionBank } from '../src/domain/types';
import { createCatalogIndex } from '../src/lib/catalog-index';

const root = path.resolve(import.meta.dirname, '..');

const SAMPLE = `## Section A — Basics \`[topic] t1\`

### Q1. Pick the \`right\` one?

> **Difficulty:** 🟢 Easy · \`[topic] t1\` · 🔮 Representative

- Wrong answer
- ✅ Right answer
- Also wrong

<details><summary>Show answer & why each option</summary>

- **Wrong** — because.
- ✅ **Right** — because it is.
- **Also wrong** — nope.
</details>

### Q2. Explain it.
> **Difficulty:** 🔴 Hard · ✅ Reported ([Source](https://example.com/a), [Other](https://example.com/b))
> **Senior frame:** The *answer*.

---

### Prompt A — Design a thing
> **Difficulty:** 🟡 Medium · ✅ Reported ([S](https://example.com))
> **How a senior frames it:** Frame first.

\`\`\`python
### Q9. not a question (inside code)
\`\`\`
`;

describe('question parser', () => {
  const questions = parseQuestionFile(SAMPLE);

  it('finds every question heading and ignores code blocks', () => {
    assert.equal(questions.length, 3);
    assert.equal(countQuestionHeadings(SAMPLE), 3);
    assert.deepEqual(questions.map((question) => question.label), ['Q1', 'Q2', 'Prompt A']);
  });

  it('parses multiple choice with per-option explanations and correctness', () => {
    const [q1] = questions;
    assert.equal(q1.format, 'multiple-choice');
    assert.equal(q1.difficulty, 'easy');
    assert.deepEqual(q1.tags, ['[topic] t1']);
    assert.deepEqual(q1.options?.map((option) => option.isCorrect), [false, true, false]);
    assert.equal(q1.options?.[1].explanationMarkdown, '**Right** — because it is.');
    assert.deepEqual(q1.warnings, []);
  });

  it('parses open-ended answers and reported sources without inventing content', () => {
    const q2 = questions[1];
    assert.equal(q2.format, 'open-ended');
    assert.equal(q2.provenance?.kind, 'reported');
    assert.deepEqual(q2.provenance?.sources.map((source) => source.url), ['https://example.com/a', 'https://example.com/b']);
    assert.equal(q2.answerMarkdown, '> **Senior frame:** The *answer*.');
    assert.equal(questions[2].section, 'Section A — Basics `[topic] t1`');
  });

  it('flags mismatched explanations instead of guessing', () => {
    const broken = parseQuestionFile('### Q1. x\n> **Difficulty:** 🟢 Easy\n\n- a\n- ✅ b\n\n<details><summary>s</summary>\n\n- only one\n</details>\n');
    assert.equal(broken[0].answerMarkdown, '- only one');
    assert.ok(broken[0].warnings.some((warning) => warning.includes('kept as one block')));
  });
});

describe('HTML safety for imported text', () => {
  it('sanitizes scripts and event handlers out of question HTML', () => {
    const html = markdownToHtml('ok <script>alert(1)</script> <img src="x" onerror="alert(1)"> [x](javascript:alert(1))');
    assert.ok(!html.includes('<script') && !html.includes('onerror') && !html.includes('javascript:'));
    assert.equal(inlineMarkdownToHtml('Use `code`'), 'Use <code>code</code>');
  });

  it('allows the GitHub tags used upstream and rejects others', () => {
    assert.deepEqual(findRawHtmlViolations('<details><summary>Show</summary></details><div align="center"><sub>x</sub></div><a name="top"></a>'), []);
    assert.ok(findRawHtmlViolations('<script>x</script>').every((violation) => violation === '<script> is not allowed'));
    assert.ok(findRawHtmlViolations('<img src="a" onerror="x">').some((violation) => violation.includes('onerror')));
    assert.ok(findRawHtmlViolations('<a href="javascript:alert(1)">x</a>').some((violation) => violation.includes('script URL')));
  });
});

describe('AI Engineer Interview course import', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/catalog.json'), 'utf8')) as Catalog;
  const index = createCatalogIndex(catalog);
  const bank = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/question-banks/ai-engineer-interview.json'), 'utf8')) as QuestionBank;

  it('imports all 13 modules, 47 lessons and 267 questions with stable ids', () => {
    const course = index.getCourse('ai-engineer-interview');
    assert.ok(course);
    assert.equal(course.status, 'active');
    assert.equal(course.categoryId, 'ai');
    assert.equal(index.courseModules('ai-engineer-interview').length, 13);
    assert.equal(index.courseItems('ai-engineer-interview').length, 47);
    assert.equal(bank.questions.length, 267);
    assert.equal(bank.questions.filter((question) => question.format === 'multiple-choice').length, 196);
    assert.ok(bank.questions.some((question) => question.id === 'ai-engineer-interview:fundamentals-q1'));
    assert.ok(bank.questions.some((question) => question.id === 'ai-engineer-interview:system-design-prompt-j'));
  });

  it('links every question to the lesson page that shows it', () => {
    for (const question of bank.questions) {
      const lesson = index.getLesson(question.lessonId);
      assert.ok(lesson, question.id);
      assert.ok(question.contextUrl.startsWith(`${lesson.url}#`), question.id);
      const set = index.getQuestionSet(question.setId);
      assert.ok(set?.questionIds.includes(question.id), question.id);
    }
    assert.deepEqual(index.lessonQuestionSets('ai-engineer-interview:concept-rag').map((set) => set.id), ['ai-engineer-interview:qset-rag']);
  });

  it('records source attribution and the pinned upstream commit', () => {
    const source = index.getCourse('ai-engineer-interview')?.source;
    assert.equal(source?.license, 'MIT');
    assert.equal(source?.upstream?.commit, '5d10bbd2526377e2671aef3cf2e8855585a83a3f');
    assert.equal(source?.licenseUrl, '/courses/ai-engineer-interview/learn/study-plans-resources/source-and-license');
  });

  it('does not change the Kubernetes course', () => {
    assert.equal(index.courseItems('kubernetes').length, 67);
    assert.equal(index.courseQuestionSets('kubernetes').length, 0);
  });
});
