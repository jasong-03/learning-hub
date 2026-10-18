import type * as PageTree from 'fumadocs-core/page-tree';
import { LucideIcon } from '@/components/lucide-icon';
import { SITE_NAME } from '@/config/site';
import { catalog, itemTitle } from '@/lib/catalog';

/** Sidebar for hub pages: global sections, then every course and path. */
export function buildHubTree(): PageTree.Root {
  const page = (name: string, url: string, icon: string): PageTree.Item => ({
    type: 'page',
    name,
    url,
    icon: <LucideIcon name={icon} />,
  });
  return {
    name: SITE_NAME,
    children: [
      page('Dashboard', '/dashboard', 'LayoutDashboard'),
      page('Courses', '/courses', 'Library'),
      page('Learning Paths', '/paths', 'Route'),
      page('Practice', '/practice', 'Dumbbell'),
      page('Review', '/review', 'RotateCcw'),
      page('Analytics', '/analytics', 'ChartColumn'),
      { type: 'separator', name: 'Courses' },
      ...catalog.data.courses.map((course) => page(course.title, course.url, course.icon)),
      { type: 'separator', name: 'Learning Paths' },
      ...catalog.data.paths.map((learningPath) => page(learningPath.title, learningPath.url, 'Route')),
    ],
  };
}

/** Sidebar inside a course: overview, labs index, then each module with its lessons and labs. */
export function buildCourseTree(courseId: string): PageTree.Root {
  const course = catalog.getCourse(courseId);
  if (!course) return { name: 'Unknown course', children: [] };

  const modules: PageTree.Folder[] = catalog.courseModules(courseId).map((module) => {
    const lessons: PageTree.Item[] = module.lessonIds.flatMap((id) => {
      const lesson = catalog.getLesson(id);
      return lesson ? [{ type: 'page', name: itemTitle(lesson), url: lesson.url }] : [];
    });
    const labs: PageTree.Item[] = module.labIds.flatMap((id) => {
      const lab = catalog.getLab(id);
      return lab ? [{ type: 'page', name: lab.title, url: lab.url }] : [];
    });
    const children: PageTree.Node[] = [...lessons];
    if (labs.length > 0) children.push({ type: 'folder', name: 'Labs', icon: <LucideIcon name="FlaskConical" />, children: labs });
    if (children.length === 0) children.push({ type: 'page', name: 'Coming soon', url: course.url });
    return {
      type: 'folder',
      name: module.title,
      icon: <LucideIcon name={module.icon} />,
      index: { type: 'page', name: module.title, url: `${course.url}/modules/${module.localId}` },
      children,
    };
  });

  return {
    name: course.title,
    children: [
      { type: 'page', name: 'Course overview', url: course.url, icon: <LucideIcon name="Info" /> },
      ...(course.labsUrl ? [{ type: 'page' as const, name: 'All labs', url: course.labsUrl, icon: <LucideIcon name="FlaskConical" /> }] : []),
      ...(course.questionsUrl ? [{ type: 'page' as const, name: 'Question bank', url: course.questionsUrl, icon: <LucideIcon name="MessagesSquare" /> }] : []),
      { type: 'separator', name: 'Modules' },
      ...modules,
    ],
  };
}
