# GitDone Backend Study Roadmap

**Role of this file:** session-agnostic progress tracker + the order of study. Each stage has its own
notes file in this folder. New sessions should be started with the bootstrap prompt at the bottom.

## Identifier

GitDone — project & task management full-stack app. Backend = Next.js 16 App Router Server Actions
(`src/actions/*.actions.ts`) + Prisma 7 driver-adapter client (`src/lib/prisma.ts`) + Neon PostgreSQL
(`prisma/schema.prisma`) + Clerk auth (`src/proxy.ts`, webhooks). No REST API except the Clerk webhook
endpoint. Zero tests. No prisma migrations folder (db push).

## Stage order & dependency logic

| Stage | Topic | Depends on | Notes file | Status |
|---|---|---|---|---|
| 0 | Execution model: Server/Client Components, Server Actions on the wire, `proxy.ts` vs `auth.protect()` | — | `stage-00-execution-model.md` | ✅ Completed 2026-10-22 |
| 1 | One mutation end-to-end: `createProject` trace, `ActionResult<T>` contract, error paths | 0 | `stage-01-one-mutation.md` | ⬜ Not started |
| 2 | Data layer: schema, relations, FK cascade, indexes, Prisma 7 driver adapter, client singleton, `revalidatePath` caching | 1 | `stage-02-data-layer.md` | ⬜ Not started |
| 3 | Identity: Clerk session mechanics, webhook + JIT sync (`ensureAppUser`), auth vs sync | 0, 2 | `stage-03-identity.md` | ⬜ Not started |
| 4 | Authorization: ownership-in-`where` pattern, P2025 semantics, `createTask` TOCTOU race, tenant-isolation audit | 1, 2, 3 | `stage-04-authorization.md` | ⬜ Not started |
| 5 | Validation & trust boundaries: Zod at the action edge, why client `maxLength` is decoration, DB constraints as backstop | 1, 4 | `stage-05-validation.md` | ⬜ Not started |
| 6 | Error handling & reliability: result-shape inconsistency, Prisma error codes (incl. dead branches), transactions, revalidation coverage | 1, 2, 4 | `stage-06-errors-reliability.md` | ⬜ Not started |
| 7 | Security deep-dive: SQL injection surface, CSRF/origin on actions, webhook forgery vs Svix, info disclosure, secret handling | 4, 5 | `stage-07-security.md` | ⬜ Not started |
| 8 | Production readiness: N+1 in `getProjects`, pagination, migrations, minimal test strategy, Neon scale-to-zero, final rebuild-from-memory capstone | 2, 6 | `stage-08-production.md` | ⬜ Not started |

Stages 5–8 deliberately re-attack the same files from a new angle (rehearsal, not new material).

## Verified findings carried forward (from initial inspection, 2026-10-22)

1. **N+1 query** in `getProjects` (`src/actions/project.actions.ts:181-188`): per-project
   `task.count` in `Promise.all`. Degrades with project count.
2. **No pagination** — explicit `// TODO: Add pagination` (`project.actions.ts:163`).
3. **Dead error branches** — `task.actions.ts` handles `P2002`/`P2003` for `updateTask`, but the schema
   has no matching unique/FK-self-constraint that would trigger them in that flow.
4. **No migrations folder** — `prisma7.config.ts` points at `prisma/migrations` which doesn't exist;
   schema was evidently applied with `db push`.
5. **No tests anywhere** (verified by glob).
6. **Race window in `createTask`** — ownership `findFirst` then separate `task.create`
   (`task.actions.ts:41-56`). Other actions bake ownership into the same query instead.
7. **Result-shape inconsistency** — `getProjectById` has a discriminated `code` union
   (`"UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL"`); every other action uses plain `ActionResult<T>`
   with a generic error string.
8. **Secrets are NOT committed** — `.env` verified untracked via `git ls-files`; covered by `.env*`
   in `.gitignore`.
9. **Injection surface** — none found in inspection: Prisma parameterizes; Zod-typed spreads mean no
   raw client shapes reach `prisma.*` calls.

## Bootstrap prompt for a fresh session

> Look at `docs/learning/00-ROADMAP.md` for orientation. Completed stages 0–N are listed as ✅.
> Continue GitDone backend tutoring from stage N+1. Read that stage's notes file in this folder
> (if it exists) plus the completed-stage files for misconceptions context. Teach one topic,
> verify against real code, and wait for me before proceeding.

## Rules (from the tutoring contract)

- Source code is the truth; docs are supporting context.
- Never claim security guarantees without reading the relevant code.
- One topic at a time; wait for the student after each lesson.
- Never modify app code unless explicitly requested.
- Make the student reason before revealing solutions; ask for explanations in their own words.
