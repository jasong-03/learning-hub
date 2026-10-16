import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { LearningItem } from '@/domain/types';
import { getMDXComponents } from '@/components/mdx';
import { LessonPracticeCard } from '@/components/practice/lesson-practice-card';
import { ItemProgressPanel } from '@/components/progress/item-progress-panel';
import { LabChecklist } from '@/components/progress/lab-checklist';
import { RelatedItems } from '@/components/progress/related-items';
import { Quiz } from '@/components/quiz/quiz';
import { Badge } from '@/components/ui/badge';
import { catalog, itemLabel } from '@/lib/catalog';
import { getPageMarkdownUrl } from '@/lib/shared';
import { source } from '@/lib/source';

type CoursePage = NonNullable<ReturnType<typeof source.getPage>>;

/** Reader for a lesson or lab page: unchanged V1 reading UI plus checklist, quiz, related items and completion. */
export function LessonView({ page, item }: { page: CoursePage; item: LearningItem }) {
  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const quiz = item.kind === 'lesson' && item.quizId ? catalog.getQuiz(item.quizId) : undefined;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap items-center gap-2 border-b pb-6">
        <Badge variant="secondary">{catalog.getModule(item.moduleId)?.title}</Badge>
        <Badge variant="outline">{itemLabel(item)}</Badge>
        <div className="ms-auto flex gap-2">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover markdownUrl={markdownUrl} />
        </div>
      </div>
      <DocsBody lang={item.lang}>
        {item.kind === 'lab' && <LabChecklist lab={item} />}
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        {quiz && <Quiz quiz={quiz} />}
        <LessonPracticeCard item={item} />
        <RelatedItems item={item} />
        <ItemProgressPanel item={item} />
      </DocsBody>
    </DocsPage>
  );
}
