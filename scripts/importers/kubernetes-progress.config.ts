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
  lang: string;
}

/** A phase guide split at its top-level "# Phần N" headings. */
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

function note(n: number, file: string, slugSuffix: string): SingleSource {
  const id = `note-${String(n).padStart(2, '0')}`;
  return {
    type: 'single',
    file,
    module: 'fundamentals',
    id,
    label: 'Note',
    slug: `${id}-${slugSuffix}`,
    lang: 'vi',
  };
}

/** Order here is the lesson order within each module. Every Markdown file in `progress/` must appear exactly once. */
export const SOURCES: Source[] = [
  note(1, 'Kubernetes Note #1 — Pod, Service, kubectl, Manifest & YAML.md', 'pod-service-kubectl-manifest-yaml'),
  note(2, 'Kubernetes Note #2 — ReplicaSet.md', 'replicaset'),
  note(3, 'Kubernetes Note #3 — Deployment.md', 'deployment'),
  note(4, 'Kubernetes Note #4 — Service Types.md', 'service-types'),
  note(5, 'Kubernetes Note #5 — Namespace.md', 'namespace'),
  note(6, 'Kubernetes Note #6 — Resource Requests & Limits.md', 'resource-requests-limits'),
  note(7, 'Kubernetes Note #7 — Command & Args.md', 'command-args'),
  note(8, 'Kubernetes Note #8 — Metrics Server & kubectl top.md', 'metrics-server-kubectl-top'),
  note(9, 'Kubernetes Note #9 — ResourceQuota.md', 'resourcequota'),
  note(10, 'Kubernetes Note #10 — LimitRange.md', 'limitrange'),
  {
    type: 'single',
    file: 'Lab Roadmap — Note #1–#10.md',
    module: 'fundamentals',
    id: 'lab-roadmap',
    label: 'Roadmap',
    slug: 'lab-roadmap',
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
 * "Lab Roadmap — Note #1–#10.md"; guide parts are matched by topic.
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

  'application-deployment-part-01': [20],
  'application-deployment-part-02': [20],
  'application-deployment-part-03': [26],
  'application-deployment-part-04': [19],
  'application-deployment-part-05': [19],
  'application-deployment-part-06': [8, 12],
  'application-deployment-part-07': [35],

  'networking-security-part-01': [15],
  'networking-security-part-02': [15],
  'networking-security-part-03': [13, 14],
  'networking-security-part-04': [22],
  'networking-security-part-05': [22],
  'networking-security-part-06': [16],
  'networking-security-part-07': [17],
  'networking-security-part-08': [16],

  'scaling-operations-part-01': [36],
  'scaling-operations-part-02': [10],
  'scaling-operations-part-03': [9],
  'scaling-operations-part-04': [3, 4, 5],
  'scaling-operations-part-06': [37, 42],
  'scaling-operations-part-07': [41],

  'production-platform-part-01': [29, 30],
  'production-platform-part-02': [24, 27],
  'production-platform-part-03': [25, 28],
  'production-platform-part-04': [32],
  'production-platform-part-05': [31, 32],
  'production-platform-part-06': [40],
  'production-platform-part-07': [23],
  'production-platform-part-09': [41],

  'aws-eks-part-03': [22],
  'aws-eks-part-06': [15],
  'aws-eks-part-07': [19],
  'aws-eks-part-08': [36],
};

export function labLocalId(labNumber: number): string {
  return `lab-${String(labNumber).padStart(2, '0')}`;
}
