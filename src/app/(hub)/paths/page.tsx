import type { Metadata } from 'next';
import { EmptyState, HubPage } from '@/components/hub/hub-page';
import { PathCard } from '@/components/hub/path-card';
import { catalog } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Learning Paths' };

export default function PathsPage() {
  return (
    <HubPage title="Learning Paths" description="Ordered sequences of courses and modules, with progress across all of them.">
      {catalog.data.paths.length === 0 ? (
        <EmptyState>No learning paths yet. Add one in content/paths/.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {catalog.data.paths.map((learningPath) => (
            <li key={learningPath.id}>
              <PathCard learningPath={learningPath} />
            </li>
          ))}
        </ul>
      )}
    </HubPage>
  );
}
