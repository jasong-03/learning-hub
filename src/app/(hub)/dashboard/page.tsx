import Link from 'next/link';
import type { Metadata } from 'next';
import { ContinueLearning } from '@/components/hub/continue-learning';
import { CourseCard } from '@/components/hub/course-card';
import { HubPage, SectionHeading } from '@/components/hub/hub-page';
import { OverallStats } from '@/components/hub/overall-stats';
import { PathCard } from '@/components/hub/path-card';
import { ResetProgressButton } from '@/components/hub/reset-progress-button';
import { catalog } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  const activeCount = catalog.data.courses.filter((course) => course.status === 'active').length;
  return (
    <HubPage
      title="Dashboard"
      description={`${catalog.data.courses.length} courses (${activeCount} with content), ${catalog.data.lessons.length} lessons and ${catalog.data.labs.length} labs. Progress is saved in this browser.`}
    >
      <section>
        <SectionHeading>Continue learning</SectionHeading>
        <ContinueLearning />
      </section>
      <OverallStats />
      <section>
        <SectionHeading action={<Link href="/courses" className="text-sm font-medium text-primary hover:underline">Browse all</Link>}>
          Courses
        </SectionHeading>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {catalog.data.courses.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <SectionHeading action={<Link href="/paths" className="text-sm font-medium text-primary hover:underline">All paths</Link>}>
          Learning paths
        </SectionHeading>
        <ul className="grid gap-4 md:grid-cols-2">
          {catalog.data.paths.map((learningPath) => (
            <li key={learningPath.id}>
              <PathCard learningPath={learningPath} />
            </li>
          ))}
        </ul>
      </section>
      <footer className="flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Progress is stored in this browser only (localStorage).</p>
        <ResetProgressButton />
      </footer>
    </HubPage>
  );
}
