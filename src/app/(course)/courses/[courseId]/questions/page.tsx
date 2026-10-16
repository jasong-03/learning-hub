import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState, HubPage } from '@/components/hub/hub-page';
import { QuestionBankView } from '@/components/practice/question-bank-view';
import { catalog } from '@/lib/catalog';
import { loadQuestionBank } from '@/lib/question-bank';

export async function generateMetadata({ params }: PageProps<'/courses/[courseId]/questions'>): Promise<Metadata> {
  const { courseId } = await params;
  return { title: `Question bank · ${catalog.getCourse(courseId)?.title ?? ''}` };
}

/** Browse, practice (by topic/difficulty) and review a course's question bank. */
export default async function QuestionBankPage({ params }: PageProps<'/courses/[courseId]/questions'>) {
  const { courseId } = await params;
  const course = catalog.getCourse(courseId);
  if (!course) notFound();
  const bank = loadQuestionBank(courseId);
  const sets = catalog.courseQuestionSets(courseId).map((set) => ({ id: set.id, topic: set.topic }));

  return (
    <HubPage
      title="Question bank"
      description={`${course.title}: practice graded multiple-choice questions and open-ended interview questions, then review what you missed.`}
    >
      {bank && bank.questions.length > 0 ? (
        // useSearchParams (filters in the URL) needs a Suspense boundary on statically rendered pages.
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading questions…</p>}>
          <QuestionBankView questions={bank.questions} sets={sets} />
        </Suspense>
      ) : (
        <EmptyState>This course has no question bank yet.</EmptyState>
      )}
    </HubPage>
  );
}
