# Current Feature

<!-- Feature name and short description -->


## Status

<!-- Not Started | In Progress | Completed -->
Not Started

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Additional notes or comments -->

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
