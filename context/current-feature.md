# Current Feature

**Last Updated:** November 28, 2026

## Status

Completed

## Goals

Bring every documentation surface back in line with what has actually shipped since the last
documentation pass (October 2026):

- Task and project due dates, and task priority (`LOW` / `MEDIUM` / `HIGH`).
- The Vitest suite (`tests/unit` + `tests/integration`) and the GitHub Actions CI workflow.
- The `migrate-on-deploy.mjs` Vercel build step.
- Remove the unused `DATABASE_URL_POOLED` variable from the README.
- Add a "Last Updated" date to every document touched.

## Notes

- The `context/features/demo-account.md` proposal is intentionally left untouched.
- Live screenshots in `public/screenshots/` and `context/screenshots/` still predate the due
  date / priority UI and must be recaptured manually from the running app.

## History

<!-- Keep a record of changes and updates. Earliest to latest -->

**Project foundation**
Next.js 16 + React 19 + TypeScript strict, Tailwind CSS v4 (CSS-first), ESLint, and the initial `docs/ARCHITECTURE.md` and PRD. Status: Completed.

**Database and ORM**
Neon PostgreSQL with Prisma v7 and the `@prisma/adapter-pg` driver adapter. `prisma/schema.prisma` defines `User`, `Project`, `Task`, and the `TaskStatus` enum; the client is generated to `src/app/generated/prisma`. Added the cached client singleton in `src/lib/prisma.ts` and the `prisma7.config.ts` datasource configuration. Status: Completed.

**Authentication**
Clerk integration: `ClerkProvider` in the root layout, sign-in/sign-up pages under the `(auth)` route group, `auth.protect()` in the `(dashboard)` layout, and `src/proxy.ts` middleware. Status: Completed.

**Identity synchronization**
Svix-verified Clerk webhook at `/api/webhooks/clerk` handling `user.created`, `user.updated`, and `user.deleted`, plus the JIT `ensureAppUser` fallback in `src/lib/ensure-app-user.ts`. Status: Completed.

**Project and task mutations**
Server Actions in `src/actions/project.actions.ts` and `src/actions/task.actions.ts` following the auth → Zod → ownership-scoped query → `revalidatePath` → `ActionResult` pipeline. Zod schemas added under `src/lib/validations/`. Status: Completed.

**Dashboard and projects UI**
Dashboard overview with metric stat cards and a recent-projects list; projects list with progress bars; project workspace with status sections, inline status dropdown, and filter tabs. Added the persistent desktop sidebar, mobile navigation sheet, and shared `Button` component with typed variants. Status: Completed.

**Loading, error, and read states**
Route-level `loading.tsx` for the dashboard, projects list, and project workspace; `error.tsx` for the dashboard route group; `ReadErrorState` with a retry affordance for failed reads. Status: Completed.

**Documentation**
README, `UI_DESIGN_SYSTEM.md`, and the architecture/PRD documents updated to reflect GitDone branding and the completed MVP. Status: Completed.

**Task due date**
Nullable `tasks.dueDate` (`@db.Date`), a shared `dateOnlyWireSchema` (`YYYY-MM-DD`, `""` → `null`) in `src/lib/validations/date-only.schema.ts`, `createTask` accepting `dueDate`, and the task card rendering `Due YYYY-MM-DD`. Shipped `f9d4af0` (merge `5a873ef`). Status: Completed.

**Task priority**
`TaskPriority` enum (`LOW` / `MEDIUM` / `HIGH`, default `MEDIUM`), `taskPriorityEnum` in `task.schema.ts`, `createTask` accepting `priority`, the Add-task dialog priority select, and the task card rendering the priority. Shipped `edc3d65` (PR #6). Status: Completed.

**Project due date**
Nullable `projects.dueDate` (`@db.Date`) reusing the shared `dateOnlyWireSchema`, the `undefined` guard in `updateProject`, and the UI surfaces on the project header, projects list, and edit dialog. Shipped `9295599` (merge `f06185f`). Status: Completed.

**Automated tests and CI**
Vitest configured (`vitest.config.ts`, `tests/setup.ts`) with schema unit tests in `tests/unit/` and database-backed integration tests in `tests/integration/`. A GitHub Actions workflow (`.github/workflows/ci.yml`) typechecks, lints, and tests every pull request and push to `main` against a disposable Postgres. Status: Completed.

**Deploy-time migrations**
`vercel-build` now runs `scripts/migrate-on-deploy.mjs`, which uses `shouldMigrate` from `scripts/migrate-decision.mjs`: production migrates production, and a preview build migrates only the `preview` branch. Status: Completed.

**Documentation sync**
README, `docs/ARCHITECTURE.md`, `docs/git-done-prd.md`, `UI_DESIGN_SYSTEM.md`, `context/project-overview.md`, `context/ai-interaction.md`, `context/coding-standards.md`, `AGENTS.md`, and `.cursorrules` updated for due dates, priority, tests/CI, and the deploy-time migration flow; the unused `DATABASE_URL_POOLED` removed from the README. Status: Completed.
