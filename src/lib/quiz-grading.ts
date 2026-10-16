/** Shared by the lesson quiz and question-bank cards: an answer is correct only if it selects exactly the correct options. */
export function isAnswerCorrect(correctOptionIds: string[], selected: string[] = []): boolean {
  const expected = [...correctOptionIds].sort();
  const actual = [...selected].sort();
  return expected.length === actual.length && expected.every((id, index) => id === actual[index]);
}
