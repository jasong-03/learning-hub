'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useFetchSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { catalog } from '@/lib/catalog';

type ContentType = 'all' | 'lessons' | 'labs';
const ALL_COURSES = 'all';

// Lab pages live under /courses/<courseId>/labs/; lessons under /learn/.
const LAB_URL = /^\/courses\/[^/]+\/labs\//;

const searchableCourses = catalog.data.courses.filter((course) => catalog.courseItems(course.id).length > 0);

function courseFromPath(pathname: string): string {
  const courseId = /^\/courses\/([^/]+)/.exec(pathname)?.[1];
  return courseId && searchableCourses.some((course) => course.id === courseId) ? courseId : ALL_COURSES;
}

/** Search across all indexed courses, filterable by course (server-side tag) and by lessons vs labs. */
export function HubSearchDialog(props: SharedProps) {
  const pathname = usePathname();
  const [course, setCourse] = useState(() => courseFromPath(pathname));
  const [contentType, setContentType] = useState<ContentType>('all');
  const search = useFetchSearch({ tag: course === ALL_COURSES ? undefined : course });

  const data = useMemo(() => {
    if (contentType === 'all' || !search.data) return search.data;
    const wantLabs = contentType === 'labs';
    return { ...search.data, items: search.data.items.filter((result) => !('url' in result) || LAB_URL.test(result.url) === wantLabs) };
  }, [search.data, contentType]);

  return (
    <SearchDialog {...search} data={data} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
        <SearchDialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TagsList tag={course} onTagChange={(value) => setCourse(value ?? ALL_COURSES)}>
            <TagsListItem value={ALL_COURSES}>All courses</TagsListItem>
            {searchableCourses.map((item) => (
              <TagsListItem key={item.id} value={item.id}>
                {item.title}
              </TagsListItem>
            ))}
          </TagsList>
          <TagsList tag={contentType} onTagChange={(value) => setContentType((value as ContentType | undefined) ?? 'all')}>
            <TagsListItem value="all">Everything</TagsListItem>
            <TagsListItem value="lessons">Lessons</TagsListItem>
            <TagsListItem value="labs">Labs</TagsListItem>
          </TagsList>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
