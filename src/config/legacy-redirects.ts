/**
 * Permanent redirects from the single-course V1 URLs (/docs/...) to the
 * multi-course routes, so existing bookmarks keep working. First match wins.
 * V1 phase slugs equal Kubernetes module ids and lesson/lab slugs are unchanged.
 */
export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  { source: '/', destination: '/dashboard', permanent: false },
  { source: '/docs', destination: '/courses/kubernetes', permanent: true },
  { source: '/docs/labs', destination: '/courses/kubernetes/labs', permanent: true },
  { source: '/docs/:module/labs/:lab', destination: '/courses/kubernetes/labs/:lab', permanent: true },
  { source: '/docs/:module/labs', destination: '/courses/kubernetes/labs', permanent: true },
  { source: '/docs/:module/:lesson', destination: '/courses/kubernetes/learn/:module/:lesson', permanent: true },
  { source: '/docs/:module', destination: '/courses/kubernetes', permanent: true },
];

/** Resolves a path with the same first-match, `:param`-segment semantics Next.js uses for these rules. */
export function resolveLegacyRedirect(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  for (const rule of LEGACY_REDIRECTS) {
    const pattern = rule.source.split('/').filter(Boolean);
    if (pattern.length !== segments.length) continue;
    const params: Record<string, string> = {};
    const isMatch = pattern.every((part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = segments[index];
        return true;
      }
      return part === segments[index];
    });
    if (isMatch) return rule.destination.replace(/:([a-z]+)/g, (_whole, name: string) => params[name]);
  }
  return null;
}
