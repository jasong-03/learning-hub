import fs from 'node:fs';
import path from 'node:path';
import type { QuestionBank } from '@/domain/types';

/**
 * Server-only: reads a course's generated question bank. Banks are kept out of
 * the client catalog bundle and passed only to the pages that need them; all
 * such pages are statically generated, so this runs at build time.
 */
export function loadQuestionBank(courseId: string): QuestionBank | null {
  const file = path.join(process.cwd(), 'src/generated/question-banks', `${courseId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as QuestionBank;
}
