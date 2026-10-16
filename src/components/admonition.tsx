import type { ReactNode } from 'react';
import { AlertTriangle, Info, Lightbulb, MessageSquareWarning, OctagonAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const KINDS = {
  note: { label: 'Note', icon: Info, className: 'border-sky-500/40 bg-sky-500/5 [&_[data-icon]]:text-sky-500' },
  tip: { label: 'Tip', icon: Lightbulb, className: 'border-emerald-500/40 bg-emerald-500/5 [&_[data-icon]]:text-emerald-500' },
  important: { label: 'Important', icon: MessageSquareWarning, className: 'border-violet-500/40 bg-violet-500/5 [&_[data-icon]]:text-violet-500' },
  warning: { label: 'Warning', icon: AlertTriangle, className: 'border-amber-500/40 bg-amber-500/5 [&_[data-icon]]:text-amber-500' },
  caution: { label: 'Caution', icon: OctagonAlert, className: 'border-red-500/40 bg-red-500/5 [&_[data-icon]]:text-red-500' },
} as const;

/** Callout box for GitHub-style alerts (see src/lib/mdx/remark-github-alerts.ts). */
export function Admonition({ kind = 'note', children }: { kind?: string; children: ReactNode }) {
  const config = KINDS[kind as keyof typeof KINDS] ?? KINDS.note;
  const Icon = config.icon;
  return (
    <div role="note" className={cn('my-5 rounded-lg border-l-4 border px-4 py-3 text-[0.95em] [&>p:first-of-type]:mt-1 [&>p:last-child]:mb-0', config.className)}>
      <p className="not-prose mb-1 flex items-center gap-1.5 text-sm font-semibold">
        <Icon data-icon className="size-4" aria-hidden />
        {config.label}
      </p>
      {children}
    </div>
  );
}
