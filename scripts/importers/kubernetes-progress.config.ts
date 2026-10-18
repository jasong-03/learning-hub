/**
 * Import configuration for the Kubernetes course: how the read-only notes in
 * `../progress` map onto the modules declared in
 * content/courses/kubernetes/course.json. Module titles and order live in
 * course.json; lesson titles and bodies come from the notes themselves.
 */

export const COURSE_ID = 'kubernetes';
/** The author's notes (outside this app). Read only when present, to refresh the snapshot below. */
export const PROGRESS_DIR = '../progress';
/**
 * Committed snapshot of PROGRESS_DIR (Markdown + images, with REDACTIONS applied) that the
 * importer builds from, so the app builds anywhere (e.g. Vercel) without the parent repository.
 */
export const NOTES_SNAPSHOT_DIR = 'vendor/kubernetes-progress';

export interface RedactionRule {
  pattern: RegExp;
  replacement: string;
  reason: string;
}

/**
 * Personal environment details removed from the published snapshot (the repo and site are public).
 * `./progress` itself is never modified. Rules whose pattern would itself reveal the value
 * (names) live in the gitignored REDACTIONS_LOCAL_FILE, so they never get committed either.
 */
export const REDACTIONS_LOCAL_FILE = 'redactions.local.json';
export const BASE_REDACTIONS: RedactionRule[] = [
  // AWS account IDs are exactly 12 digits; the notes contain no other 12-digit numbers.
  { pattern: /\b\d{12}\b/g, replacement: '<AWS_ACCOUNT_ID>', reason: 'AWS account ID' },
];
export const EXPECTED_LAB_COUNT = 46;

/** Code-fence languages Shiki does not bundle are rendered as plain text. */
export const FENCE_LANGUAGE_FALLBACK = 'text';

export type LessonLabel = 'Note' | 'Roadmap' | 'Overview' | 'Guide';

/** A source file rendered as exactly one lesson page. */
export interface SingleSource {
  type: 'single';
  file: string;
  module: string;
  /** Stable local lesson id (kept identical to V1 so saved progress maps 1:1). */
  id: string;
  label: LessonLabel;
  /** URL slug, pinned so links and bookmarks survive edits to the note's title. */
  slug: string;
  /** Short name for the sidebar and lists; the page heading keeps the note's own H1. */
  navTitle: string;
  lang: string;
}

/** A phase guide rendered as one page; its "# Phần N" parts become sections. */
export interface GuideSource {
  type: 'guide';
  file: string;
  module: string;
  lang: string;
}

/** The merged labs file split at its `<a id="lab-NN">` anchors. */
export interface LabsBundleSource {
  type: 'labs-bundle';
  file: string;
  lang: string;
}

export type Source = SingleSource | GuideSource | LabsBundleSource;

function note(n: number, file: string, slugSuffix: string, topic: string): SingleSource {
  const id = `note-${String(n).padStart(2, '0')}`;
  return {
    type: 'single',
    file,
    module: 'fundamentals',
    id,
    label: 'Note',
    slug: `${id}-${slugSuffix}`,
    navTitle: `Note #${n} — ${topic}`,
    lang: 'vi',
  };
}

/** Order here is the lesson order within each module. Every Markdown file in `progress/` must appear exactly once. */
export const SOURCES: Source[] = [
  note(1, 'Kubernetes Note #1 — Pod, Service, kubectl, Manifest & YAML.md', 'pod-service-kubectl-manifest-yaml', 'Pod, Service, kubectl & YAML'),
  note(2, 'Kubernetes Note #2 — ReplicaSet.md', 'replicaset', 'ReplicaSet'),
  note(3, 'Kubernetes Note #3 — Deployment.md', 'deployment', 'Deployment'),
  note(4, 'Kubernetes Note #4 — Service Types.md', 'service-types', 'Service Types'),
  note(5, 'Kubernetes Note #5 — Namespace.md', 'namespace', 'Namespace'),
  note(6, 'Kubernetes Note #6 — Resource Requests & Limits.md', 'resource-requests-limits', 'Resource Requests & Limits'),
  note(7, 'Kubernetes Note #7 — Command & Args.md', 'command-args', 'Command & Args'),
  note(8, 'Kubernetes Note #8 — Metrics Server & kubectl top.md', 'metrics-server-kubectl-top', 'Metrics Server & kubectl top'),
  note(9, 'Kubernetes Note #9 — ResourceQuota.md', 'resourcequota', 'ResourceQuota'),
  note(10, 'Kubernetes Note #10 — LimitRange.md', 'limitrange', 'LimitRange'),
  {
    type: 'single',
    file: 'Lab Roadmap — Note #1–#10.md',
    module: 'fundamentals',
    id: 'lab-roadmap',
    label: 'Roadmap',
    slug: 'lab-roadmap',
    navTitle: 'Lab Roadmap — Notes #1–#10',
    lang: 'vi',
  },
  { type: 'guide', file: 'Application Deployment.md', module: 'application-deployment', lang: 'vi' },
  { type: 'guide', file: 'Networking & Security.md', module: 'networking-security', lang: 'vi' },
  { type: 'guide', file: 'Scaling & Operations.md', module: 'scaling-operations', lang: 'vi' },
  { type: 'guide', file: 'Production Platform.md', module: 'production-platform', lang: 'vi' },
  { type: 'guide', file: 'AWS EKS Production.md', module: 'aws-eks', lang: 'vi' },
  { type: 'labs-bundle', file: 'Kubernetes Labs — All Labs (01–46).md', lang: 'en' },
];

/**
 * Editorial assignment of each of the 46 labs to one module. A lab appears in
 * that module's sidebar; the labs index keeps the original 1-46 order.
 */
export const LAB_MODULES: Record<string, number[]> = {
  fundamentals: [1, 2, 6, 7, 14, 21, 24, 44],
  'application-deployment': [8, 11, 12, 19, 20, 26, 35],
  'networking-security': [13, 15, 16, 17, 18, 22, 23],
  'scaling-operations': [3, 4, 5, 9, 10, 36, 37, 41, 42, 45],
  'production-platform': [25, 27, 28, 29, 30, 31, 32, 33, 34, 38, 39, 40, 43, 46],
  'aws-eks': [],
};

/**
 * Lesson -> related lab numbers. Notes follow the mapping in
 * "Lab Roadmap — Note #1–#10.md"; each phase guide lists the labs matching its parts' topics.
 * The reverse direction (lab -> lessons) is derived by the catalog builder.
 */
export const RELATED_LABS: Record<string, number[]> = {
  'note-01': [1],
  'note-02': [6],
  'note-03': [6, 7],
  'note-04': [14],
  'note-05': [2],
  'note-06': [21],
  'note-07': [21],
  'note-08': [24, 21, 36],
  'note-09': [2],
  'lab-roadmap': [1, 2, 6, 7, 14, 21, 24],

  'application-deployment-overview': [8, 12, 19, 20, 26, 35],
  'networking-security-overview': [13, 14, 15, 16, 17, 22],
  'scaling-operations-overview': [3, 4, 5, 9, 10, 36, 37, 41, 42],
  'production-platform-overview': [23, 24, 25, 27, 28, 29, 30, 31, 32, 40, 41],
  'aws-eks-overview': [15, 19, 22, 36],
};

export function labLocalId(labNumber: number): string {
  return `lab-${String(labNumber).padStart(2, '0')}`;
}
