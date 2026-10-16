import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { buildHubTree } from '@/lib/navigation';

export default function HubLayout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout tree={buildHubTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
