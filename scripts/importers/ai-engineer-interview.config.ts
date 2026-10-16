/**
 * Import configuration for the "AI Engineer Interview Preparation" course,
 * sourced from https://github.com/landedjobs/awesome-ai-engineer-interview (MIT).
 *
 * Every upstream file must be listed here as a lesson, a question set's lesson,
 * or an exclusion with a reason; the importer fails on unlisted files so new
 * upstream content is never silently dropped. Local ids are stable and never
 * derived from upstream titles, so progress survives upstream renames as long
 * as this mapping is kept.
 */

export const COURSE_ID = 'ai-engineer-interview';

export const UPSTREAM = {
  repository: 'landedjobs/awesome-ai-engineer-interview',
  url: 'https://github.com/landedjobs/awesome-ai-engineer-interview',
  /** Pinned upstream commit. Change it and run `pnpm import:ai-interview` to update. */
  ref: '5d10bbd2526377e2671aef3cf2e8855585a83a3f',
} as const;

/** Unmodified upstream snapshot (relative to the app root), written by scripts/vendor-github-repo.ts. */
export const VENDOR_DIR = 'vendor/awesome-ai-engineer-interview';

/** Files and folders not copied into the vendor snapshot (repository tooling, not learning content). */
export const VENDOR_EXCLUDE: { path: string; reason: string }[] = [
  { path: '.git', reason: 'Git history' },
  { path: '.github', reason: 'Issue/PR templates and CI workflow (repository configuration)' },
  { path: '.gitignore', reason: 'Repository configuration' },
];

export type LessonLabel = 'Concept' | 'Questions' | 'System design' | 'Company guide' | 'Guide';

export interface LessonSource {
  /** Upstream path. */
  path: string;
  /** Stable local lesson id. */
  id: string;
  module: string;
  slug: string;
  label: LessonLabel;
}

/** Lesson order within a module follows this array. */
export const LESSONS: LessonSource[] = [
  { path: 'content/01-llm-fundamentals.md', id: 'concept-llm-fundamentals', module: 'llm-fundamentals', slug: 'llm-fundamentals', label: 'Concept' },
  { path: 'content/02-rag.md', id: 'concept-rag', module: 'rag', slug: 'rag', label: 'Concept' },
  { path: 'content/03-agents-and-tool-use.md', id: 'concept-agents-and-tool-use', module: 'agents-mcp', slug: 'agents-and-tool-use', label: 'Concept' },
  { path: 'content/04-evals-and-llm-as-judge.md', id: 'concept-evals-and-llm-as-judge', module: 'evals-reliability', slug: 'evals-and-llm-as-judge', label: 'Concept' },
  { path: 'content/05-llmops-cost-latency.md', id: 'concept-llmops-cost-latency', module: 'llmops-cost-latency', slug: 'llmops-cost-latency', label: 'Concept' },
  { path: 'content/06-fine-tuning-and-inference.md', id: 'concept-fine-tuning-and-inference', module: 'fine-tuning-inference', slug: 'fine-tuning-and-inference', label: 'Concept' },
  { path: 'content/07-ml-and-llm-system-design.md', id: 'concept-ml-and-llm-system-design', module: 'system-design', slug: 'ml-and-llm-system-design', label: 'Concept' },
  { path: 'content/08-prompt-engineering-and-structured-output.md', id: 'concept-prompt-engineering-and-structured-output', module: 'prompting-structured-output', slug: 'prompt-engineering-and-structured-output', label: 'Concept' },
  { path: 'content/09-security-and-guardrails.md', id: 'concept-security-and-guardrails', module: 'security-guardrails', slug: 'security-and-guardrails', label: 'Concept' },

  { path: 'questions/README.md', id: 'question-bank-guide', module: 'question-bank', slug: 'question-bank-guide', label: 'Guide' },
  { path: 'questions/fundamentals.md', id: 'questions-fundamentals', module: 'question-bank', slug: 'fundamentals', label: 'Questions' },
  { path: 'questions/rag.md', id: 'questions-rag', module: 'question-bank', slug: 'rag', label: 'Questions' },
  { path: 'questions/agents.md', id: 'questions-agents', module: 'question-bank', slug: 'agents', label: 'Questions' },
  { path: 'questions/evals.md', id: 'questions-evals', module: 'question-bank', slug: 'evals', label: 'Questions' },
  { path: 'questions/llmops.md', id: 'questions-llmops', module: 'question-bank', slug: 'llmops', label: 'Questions' },
  { path: 'questions/fine-tuning.md', id: 'questions-fine-tuning', module: 'question-bank', slug: 'fine-tuning', label: 'Questions' },
  { path: 'questions/system-design.md', id: 'questions-system-design', module: 'question-bank', slug: 'system-design', label: 'Questions' },
  { path: 'questions/coding.md', id: 'questions-coding', module: 'question-bank', slug: 'coding', label: 'Questions' },
  { path: 'questions/behavioral.md', id: 'questions-behavioral', module: 'question-bank', slug: 'behavioral', label: 'Questions' },

  { path: 'answers/system-design-rubric.md', id: 'system-design-rubric', module: 'worked-system-designs', slug: 'system-design-rubric', label: 'Guide' },
  { path: 'answers/rag-over-10m-docs.md', id: 'design-rag-over-10m-docs', module: 'worked-system-designs', slug: 'rag-over-10m-docs', label: 'System design' },
  { path: 'answers/semantic-search.md', id: 'design-semantic-search', module: 'worked-system-designs', slug: 'semantic-search', label: 'System design' },
  { path: 'answers/support-bot.md', id: 'design-support-bot', module: 'worked-system-designs', slug: 'support-bot', label: 'System design' },
  { path: 'answers/agentic-workflow.md', id: 'design-agentic-workflow', module: 'worked-system-designs', slug: 'agentic-workflow', label: 'System design' },
  { path: 'answers/coding-agent.md', id: 'design-coding-agent', module: 'worked-system-designs', slug: 'coding-agent', label: 'System design' },
  { path: 'answers/eval-pipeline.md', id: 'design-eval-pipeline', module: 'worked-system-designs', slug: 'eval-pipeline', label: 'System design' },
  { path: 'answers/content-moderation.md', id: 'design-content-moderation', module: 'worked-system-designs', slug: 'content-moderation', label: 'System design' },
  { path: 'answers/llm-inference-at-scale.md', id: 'design-llm-inference-at-scale', module: 'worked-system-designs', slug: 'llm-inference-at-scale', label: 'System design' },
  { path: 'answers/ai-candidate-sourcing.md', id: 'design-ai-candidate-sourcing', module: 'worked-system-designs', slug: 'ai-candidate-sourcing', label: 'System design' },
  { path: 'answers/hallucination-free-banking-chatbot.md', id: 'design-hallucination-free-banking-chatbot', module: 'worked-system-designs', slug: 'hallucination-free-banking-chatbot', label: 'System design' },

  { path: 'company/README.md', id: 'company-loops-overview', module: 'company-guides', slug: 'overview', label: 'Guide' },
  ...['openai', 'anthropic', 'google-deepmind', 'meta', 'scale', 'xai', 'databricks', 'perplexity', 'cohere', 'mistral', 'cursor', 'nvidia'].map(
    (company): LessonSource => ({ path: `company/${company}.md`, id: `company-${company}`, module: 'company-guides', slug: company, label: 'Company guide' }),
  ),

  { path: 'README.md', id: 'repository-guide', module: 'study-plans-resources', slug: 'repository-guide', label: 'Guide' },
  { path: 'resources.md', id: 'resource-hub', module: 'study-plans-resources', slug: 'resource-hub', label: 'Guide' },
  { path: 'CONTRIBUTING.md', id: 'contributing-and-quality-spec', module: 'study-plans-resources', slug: 'contributing-and-quality-spec', label: 'Guide' },
];

/** Learning Hub page (not from upstream) holding the license text and import provenance. */
export const SOURCE_LESSON = { id: 'source-and-license', module: 'study-plans-resources', slug: 'source-and-license' } as const;

/** Upstream files rendered elsewhere than as their own lesson. */
export const NON_LESSON_FILES: { path: string; renderedAs: string }[] = [
  { path: 'LICENSE', renderedAs: 'Included verbatim on the Source & License page and in the course source section' },
];

export interface QuestionSetSource {
  /** Lesson (local id) whose page shows these questions in context. */
  lessonId: string;
  /** Stable set id. */
  setId: string;
  /** Question ids are `<questionIdPrefix>-<upstream label>`, e.g. `fundamentals-q12`, `system-design-prompt-a`. */
  questionIdPrefix: string;
  topic: string;
  /** Concept lessons this set practices (local ids). */
  relatedLessonIds: string[];
}

/** questions/README.md only shows a format example, so it is a guide lesson, not a question set. */
export const QUESTION_SETS: QuestionSetSource[] = [
  { lessonId: 'questions-fundamentals', setId: 'qset-fundamentals', questionIdPrefix: 'fundamentals', topic: 'LLM fundamentals & transformers', relatedLessonIds: ['concept-llm-fundamentals', 'concept-prompt-engineering-and-structured-output'] },
  { lessonId: 'questions-rag', setId: 'qset-rag', questionIdPrefix: 'rag', topic: 'RAG', relatedLessonIds: ['concept-rag'] },
  { lessonId: 'questions-agents', setId: 'qset-agents', questionIdPrefix: 'agents', topic: 'Agents & MCP', relatedLessonIds: ['concept-agents-and-tool-use'] },
  { lessonId: 'questions-evals', setId: 'qset-evals', questionIdPrefix: 'evals', topic: 'Evals & security', relatedLessonIds: ['concept-evals-and-llm-as-judge', 'concept-security-and-guardrails'] },
  { lessonId: 'questions-llmops', setId: 'qset-llmops', questionIdPrefix: 'llmops', topic: 'LLMOps', relatedLessonIds: ['concept-llmops-cost-latency'] },
  { lessonId: 'questions-fine-tuning', setId: 'qset-fine-tuning', questionIdPrefix: 'fine-tuning', topic: 'Fine-tuning & inference', relatedLessonIds: ['concept-fine-tuning-and-inference'] },
  { lessonId: 'questions-system-design', setId: 'qset-system-design', questionIdPrefix: 'system-design', topic: 'System design', relatedLessonIds: ['concept-ml-and-llm-system-design', 'system-design-rubric'] },
  { lessonId: 'questions-coding', setId: 'qset-coding', questionIdPrefix: 'coding', topic: 'Coding rounds', relatedLessonIds: [] },
  { lessonId: 'questions-behavioral', setId: 'qset-behavioral', questionIdPrefix: 'behavioral', topic: 'Behavioral & alignment', relatedLessonIds: [] },
];

/**
 * Upstream directory links -> where they lead in the hub. Directory links have
 * no single file target upstream (GitHub shows a listing), so map them to the
 * page that plays that role here.
 */
export const DIRECTORY_LINKS: Record<string, string> = {
  content: '', // course overview
  questions: 'learn/question-bank/question-bank-guide',
  answers: 'learn/worked-system-designs/system-design-rubric',
  company: 'learn/company-guides/overview',
};

/** Question totals stated by upstream (questions/README.md); the validator checks the parse matches. */
export const EXPECTED_QUESTION_COUNTS = { multipleChoice: 196, openEnded: 71 } as const;
