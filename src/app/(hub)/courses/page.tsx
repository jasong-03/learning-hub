import type { Metadata } from 'next';
import { CourseCard } from '@/components/hub/course-card';
import { CourseCatalog } from '@/components/hub/course-catalog';
import { HubPage } from '@/components/hub/hub-page';
import { LEVELS } from '@/domain/schema';
import { LEVEL_LABELS, catalog } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Courses' };

export default function CoursesPage() {
  return (
    <HubPage title="Courses" description="Every course in the hub. Planned courses list their modules and fill in as lessons are written.">
      <CourseCatalog
        entries={catalog.data.courses.map((course) => ({
          course: { id: course.id, categoryId: course.categoryId, level: course.level, status: course.status },
          card: <CourseCard course={course} />,
        }))}
        categories={catalog.data.categories.map((category) => ({ value: category.id, label: category.title }))}
        levels={LEVELS.map((level) => ({ value: level, label: LEVEL_LABELS[level] }))}
      />
    </HubPage>
  );
}
