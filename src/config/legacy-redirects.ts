/**
 * Permanent redirects from the single-course V1 URLs (/docs/...) to the
 * multi-course routes, so existing bookmarks keep working. First match wins.
 * V1 phase slugs equal Kubernetes module ids and lesson/lab slugs are unchanged.
 * Phase guides used to be split into one page per part ("part-NN-<topic>");
 * those URLs now go to the single guide page of the same module.
 */
export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

// Matches a former guide part slug, e.g. "part-03-health-probes".
const GUIDE_PART = ':part(part-\\d{2}-[a-z0-9-]+)';
const GUIDE_PAGE = '/courses/kubernetes/learn/:module/overview';

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  { source: `/courses/kubernetes/learn/:module/${GUIDE_PART}`, destination: GUIDE_PAGE, permanent: true },
  { source: `/docs/:module/${GUIDE_PART}`, destination: GUIDE_PAGE, permanent: true },
  { source: '/', destination: '/dashboard', permanent: false },
  { source: '/docs', destination: '/courses/kubernetes', permanent: true },
  { source: '/docs/labs', destination: '/courses/kubernetes/labs', permanent: true },
  { source: '/docs/:module/labs/:lab', destination: '/courses/kubernetes/labs/:lab', permanent: true },
  { source: '/docs/:module/labs', destination: '/courses/kubernetes/labs', permanent: true },
  { source: '/docs/:module/:lesson', destination: '/courses/kubernetes/learn/:module/:lesson', permanent: true },
  { source: '/docs/:module', destination: '/courses/kubernetes', permanent: true },
];

// A rule segment that captures a parameter, optionally constrained by a regex: `:name` or `:name(pattern)`.
const PARAM_SEGMENT = /^:([a-z]+)(?:\((.+)\))?$/;

/** Resolves a path with the same first-match, `:param(pattern)`-segment semantics Next.js uses for these rules. */
export function resolveLegacyRedirect(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  for (const rule of LEGACY_REDIRECTS) {
    const pattern = rule.source.split('/').filter(Boolean);
    if (pattern.length !== segments.length) continue;
    const params: Record<string, string> = {};
    const isMatch = pattern.every((part, index) => {
      const param = PARAM_SEGMENT.exec(part);
      if (param) {
        if (param[2] && !new RegExp(`^(?:${param[2]})$`).test(segments[index])) return false;
        params[param[1]] = segments[index];
        return true;
      }
      return part === segments[index];
    });
    if (isMatch) return rule.destination.replace(/:([a-z]+)/g, (_whole, name: string) => params[name]);
  }
  return null;
}
