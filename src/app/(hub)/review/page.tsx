import type { Metadata } from 'next';
import { HubPage } from '@/components/hub/hub-page';
import { ReviewBoard, type ReviewQuestion } from '@/components/hub/review-board';
import { catalog } from '@/lib/catalog';
import { loadQuestionBank } from '@/lib/question-bank';

export const metadata: Metadata = { title: 'Review' };

export default function ReviewPage() {
  // Compact question list so the client can show which ones need review without shipping full answers.
  const questions: ReviewQuestion[] = catalog.data.courses.flatMap((course) =>
    (loadQuestionBank(course.id)?.questions ?? []).map((question) => ({
      id: question.id,
      label: question.label,
      promptHtml: question.promptHtml,
      topic: question.topic,
      courseTitle: course.title,
      reviewUrl: `${course.questionsUrl ?? course.url}?mode=review`,
    })),
  );
  return (
    <HubPage title="Review" description="Questions to revisit, missed quiz questions, half-finished labs and lessons worth refreshing.">
      <ReviewBoard questions={questions} />
    </HubPage>
  );
}
