import Link from 'next/link';
import { ExternalLink, Scale } from 'lucide-react';
import type { Course } from '@/domain/types';
import { SectionHeading } from '@/components/hub/hub-page';

/** Attribution for imported courses: repository, maintainers/contributors, license and the imported commit. */
export function CourseSource({ course }: { course: Course }) {
  const source = course.source;
  if (!source) return null;
  const upstream = source.upstream;
  return (
    <section>
      <SectionHeading>Source</SectionHeading>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 text-sm">
        <p className="text-muted-foreground">
          Lessons and questions in this course are imported from an open-source repository without rewriting. Learning Hub adds navigation, progress tracking and the
          interactive question bank.
        </p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Repository</dt>
          <dd>
            <a href={source.url} className="inline-flex items-center gap-1 text-primary hover:underline" target="_blank" rel="noreferrer">
              {upstream?.repository ?? source.name}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </dd>
          <dt className="text-muted-foreground">License</dt>
          <dd>
            {source.license}, © {source.licenseHolder}
            {source.licenseUrl && (
              <>
                {' · '}
                <Link href={source.licenseUrl} className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Scale className="size-3" aria-hidden />
                  Full license text
                </Link>
              </>
            )}
          </dd>
          {upstream && (
            <>
              <dt className="text-muted-foreground">Contributors</dt>
              <dd>{upstream.contributors.join(', ')}</dd>
              <dt className="text-muted-foreground">Imported commit</dt>
              <dd className="break-all">
                <a href={`${upstream.url}/tree/${upstream.commit}`} className="font-mono text-xs text-primary hover:underline" target="_blank" rel="noreferrer">
                  {upstream.commit.slice(0, 12)}
                </a>{' '}
                <span className="text-muted-foreground">({upstream.commitDate.slice(0, 10)})</span>
              </dd>
              <dt className="text-muted-foreground">Imported on</dt>
              <dd>{upstream.importedAt}</dd>
            </>
          )}
        </dl>
      </div>
    </section>
  );
}
