import { icons, type LucideProps } from 'lucide-react';

/**
 * Renders a Lucide icon from its name in content metadata (course.json, modules).
 * Server-only usage keeps the full icon map out of client bundles.
 */
export function LucideIcon({ name, fallback = 'BookOpen', ...props }: { name?: string; fallback?: keyof typeof icons } & LucideProps) {
  const Icon = (name && icons[name as keyof typeof icons]) || icons[fallback];
  return <Icon aria-hidden {...props} />;
}
