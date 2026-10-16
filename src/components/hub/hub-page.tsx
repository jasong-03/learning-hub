import type { ReactNode } from 'react';
import { DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';

/** Page shell for hub and overview pages rendered inside a DocsLayout (no TOC, no prev/next footer). */
export function HubPage({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <DocsPage full toc={[]} footer={{ enabled: false }} breadcrumb={{ enabled: false }}>
      <div className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <DocsTitle>{title}</DocsTitle>
          {description && <DocsDescription className="mb-0">{description}</DocsDescription>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="flex flex-col gap-8 pt-6">{children}</div>
    </DocsPage>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
