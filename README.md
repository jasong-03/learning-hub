# Personal Learning Hub

A multi-course learning site: courses, modules, lessons, hands-on labs, quizzes and learning paths, with progress stored in the browser (localStorage). It is built with Next.js (App Router), Fumadocs, Tailwind CSS v4 and shadcn/ui (Base UI). There is no account or database.

Two courses have content:
- **Kubernetes: Zero to Production** is generated from the read-only notes in [`../progress`](../progress).
- **AI Engineer Interview Preparation** is imported from [landedjobs/awesome-ai-engineer-interview](https://github.com/landedjobs/awesome-ai-engineer-interview) (MIT; see the course's Source section and Source & License page).

The AWS, AI Engineering and English courses are outlines (metadata only) until their lessons are written.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Generate content, then start the dev server |
| `pnpm generate` | Run course importers and write `src/generated/catalog.json` (fails on any schema or reference error) |
| `pnpm check:content` | Check for a stale catalog, duplicate ids, URLs and slugs, broken links and anchors, missing images, raw HTML and checklist anchors, and that no Kubernetes source words were lost |
| `pnpm test` | Unit tests: progress migration, progress isolation, path progress, Kubernetes regression against V1 |
| `pnpm test:smoke` | HTTP checks against a running server (`BASE_URL`, default `http://localhost:3000`): all routes, V1 redirects, search |
| `pnpm types:check`, `pnpm lint`, `pnpm build` | Typecheck, ESLint, production build |
| `pnpm verify` | generate, check:content, test, types:check, lint, build |
| `pnpm import:ai-interview [--ref <sha>]` | Refresh the vendored upstream snapshot (network), then regenerate |

If the browser shows HTTP 431 on `localhost`, it is sending oversized cookies left by other apps. Start with `NODE_OPTIONS=--max-http-header-size=131072 pnpm dev`, or open `http://127.0.0.1:3000`.

## Content layout

```text
content/
  categories.json                       categories (cloud-native, cloud, ai, languages)
  paths/<pathId>.json                   learning paths: ordered courses and/or modules
  courses/<courseId>/
    course.json                         metadata + ordered modules (schema: src/domain/schema.ts)
    quizzes/<quizId>.json               optional quizzes, each tied to one lesson
    learn/<moduleId>/<slug>.md          lessons
    labs/<slug>.md                      labs
    labs/index.md                       optional intro for the course's labs page
```

Every entity has a stable kebab-case id. Course-scoped ids are global as `<courseId>:<localId>` (for example `kubernetes:note-03`). Ids never come from titles or file paths, so renaming a file or title does not lose progress. If an id itself must change, add it to `src/lib/progress/aliases.ts`.

### Writing a lesson or lab

```markdown
---
type: lesson            # or: lab
id: iam-basics          # stable local id, unique within the course
title: IAM basics
module: iam             # a module id from course.json
order: 0                # position within the module
relatedLabs: [iam-lab]  # lessons only, optional
---
```

- Relative images and links (`./diagram.png`, `../../labs/x.md`) work.
- Lab checklists are built from the lab's `Step N` / `Part X` headings (or the sub-headings of a `Steps` section) plus `Verification` and `Cleanup`.
- When a course gets its first lessons, set its `status` to `active`.

### Kubernetes import

`scripts/importers/kubernetes-progress.ts` (configured by `kubernetes-progress.config.ts`) splits `../progress` into lessons and labs under `content/courses/kubernetes/`. Its output is gitignored. Edit the notes in `../progress`, never the generated files. The transforms are listed in `plans/261016-1355-k8s-learning-hub/plan.md`.

### AI Engineer Interview import

The workflow pins one upstream commit and rebuilds offline from an unmodified snapshot:

1. `scripts/importers/ai-engineer-interview.config.ts` pins `UPSTREAM.ref` and maps every upstream file to a lesson with a stable id, a module and a slug. Exclusions (`.github/`, `.gitignore`) carry a reason.
2. `pnpm import:ai-interview` fetches that commit and copies its files, unmodified, to `vendor/awesome-ai-engineer-interview/`. It records the commit, its date, the contributors and per-file SHA-256 checksums in `UPSTREAM.json`, and executes nothing from upstream.
3. `pnpm generate` (`scripts/importers/ai-engineer-interview.ts`) builds the course from the snapshot. Each upstream file becomes a lesson. The H1 moves into the title, and relative links point at the matching hub pages, or at GitHub at the pinned commit for files that aren't imported. The question files are also parsed into `content/courses/ai-engineer-interview/questions/*.json`.

To update to a newer upstream commit:
1. Change `UPSTREAM.ref`.
2. Run `pnpm import:ai-interview`.
3. Map any new files in the config. The importer fails on unmapped files.
4. Run `pnpm verify`.

Progress is keyed by the stable lesson and question ids, so it carries over. If upstream renumbers questions, add the old→new ids to `src/lib/progress/aliases.ts`.

`pnpm check:content` checks that:
- the snapshot is unmodified;
- every upstream word appears, in order, on its page;
- the question bank has the upstream counts (196 multiple-choice + 71 open-ended);
- every question's anchor exists on its lesson page;
- raw HTML stays within `scripts/lib/raw-html-policy.ts`.

### Question banks

A course can have `content/courses/<courseId>/questions/<setId>.json` (schema: `questionSetFileSchema` in `src/domain/schema.ts`). Each question is multiple choice, with per-option explanations, or open-ended, with an answer. Questions can carry a difficulty, a section and a provenance (reported, with sources, or representative).

The bank page `/courses/<courseId>/questions` has three modes: Browse, Practice (graded multiple choice, or reveal and self-assess) and Review (questions answered wrong or marked "Review again"). Its filters live in the URL, for example `?mode=practice&set=<setId>&difficulty=hard`. Results are stored in the same progress store under global question ids.

## Routes

| Route | Page |
|---|---|
| `/dashboard` | Continue learning across courses, stats, courses, paths (`/` redirects here) |
| `/courses`, `/courses/[courseId]` | Catalog with filters; course overview |
| `/courses/[courseId]/learn/[...slug]` | Lesson reader |
| `/courses/[courseId]/labs`, `/courses/[courseId]/labs/[labId]` | Labs index; lab reader with checklist (`labId` is the lab slug) |
| `/courses/[courseId]/questions` | Question bank: browse, practice by topic or difficulty, review answers |
| `/courses/[courseId]/modules/[moduleId]` | Module overview (for example Worked System Designs, Company Interview Guides) |
| `/paths`, `/paths/[pathId]` | Learning paths with aggregate progress |
| `/practice`, `/review`, `/analytics` | Labs and quizzes; things to revisit; progress analytics |

Old V1 URLs (`/docs/...`) permanently redirect to their new locations (`src/config/legacy-redirects.ts`).

## Progress storage

The store lives in `src/lib/progress/`. The key is `learning-hub:progress:v2`, which holds completions, checklist steps, quiz results, question-practice results, the last visited item per course and orphans. Saves made before question results existed load unchanged, and their question results default to empty.

On first load, V1 data (`k8s-learning-hub:progress`) is merged in once:
- Its ids get the `kubernetes:` prefix.
- Existing v2 entries always win.
- The V1 key is kept as a backup.

Entries for ids that no longer exist move to `orphans` and come back automatically if the id, or an alias for it, reappears.
