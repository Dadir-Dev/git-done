# GitDone Coding Standards

> The engineering conventions for GitDone. This document implements the technical decisions in [the project overview](./project-overview.md); if a conflict appears, update both documents in the same change, or explicitly record the decision. The authoritative architecture reference is [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) and the visual language is [`UI_DESIGN_SYSTEM.md`](../UI_DESIGN_SYSTEM.md).

## Guiding rules

1. **Secure ownership first.** Every protected read and mutation is scoped to the authenticated Clerk user inside the query itself.
2. **Prefer the server.** Read with React Server Components; keep the client boundary as small as practical.
3. **Validate at every boundary.** External data — form input, Server Action arguments, webhook payloads, environment variables — is parsed with Zod before use.
4. **Return results, don't throw for expected failures.** Server Actions return a typed `ActionResult`; the UI branches on `success`.
5. **Accessible, responsive, and fast are acceptance criteria**, not polish deferred to the end.

## TypeScript

- Enable TypeScript `strict` mode. Do not weaken compiler checks to silence an error.
- Do not use `any`. Use `unknown` at trust boundaries, then narrow it with Zod or a type guard.
- Prefer inference for local implementation details; declare explicit exported function return types, public component props, and shared data contracts. Every Server Action declares its `Promise<ActionResult<T>>` return type.
- Use `type` for unions, utility types, and data shapes; use `interface` only when declaration merging or extension is useful. Do not introduce a type solely because a value can be inferred.
- Derive database types from the generated Prisma client (`src/app/generated/prisma`). Never hand-maintain a duplicate of a table shape.
- Use `satisfies` for configuration objects and `as const` for immutable literal maps. Avoid unsafe type assertions; if one is unavoidable, isolate and explain it. The existing `as string` cast on `process.env.DATABASE_URL` in `src/lib/prisma.ts` is the accepted pattern for that boundary.
- Use `import type` for type-only imports, as in `src/actions/task.actions.ts`.
- **Zod input vs output types matter.** When a schema supplies a default (for example `status: taskStatusEnum.default("TODO")` in `task.schema.ts`), export `z.input<typeof schema>` as the caller-facing input type and `z.infer<typeof schema>` as the parsed/internal type. `CreateTaskInput` uses `z.input` for exactly this reason; do not "fix" it to `z.infer`.
- Do not use non-null assertions to bypass validation. Narrow with Zod or a guard instead.

## Naming and modules

| Thing | Convention | Example |
| --- | --- | --- |
| React component / type | PascalCase | `ProjectWorkspace`, `ProjectDetail` |
| Function / variable / hook | camelCase | `createProject`, `useTransition` binding |
| Constant / config map | camelCase object, or SCREAMING_SNAKE_CASE for true module constants | `navigationItems`, `variantClasses` |
| Files and folders | kebab-case | `project-workspace.tsx`, `read-error-state.tsx` |
| Server Action module | `<feature>.actions.ts` | `project.actions.ts`, `task.actions.ts` |
| Zod schema module | `<feature>.schema.ts` | `project.schema.ts` |
| Database tables / columns | `snake_case` in PostgreSQL, camelCase in TypeScript | `userId` → `user_id` (via `@map`/`@@map`) |
| Route segment | lowercase kebab-case | `/projects/[projectId]` |

- Components are **default-exported** (`export default function Button(...)`), matching every component in the repo. Utilities and pure helpers use **named exports** (`export function buttonStyles(...)`).
- Avoid barrel files. Import directly from the owning module.
- Use the `@/src/...` path alias. Note the `src` segment — the alias maps to the project root, so the prefix is part of every import path.
- Delete obsolete code rather than commenting it out. Remove unused imports and variables before opening a pull request. Source control preserves history.

## Project organization

```text
src/
  actions/                 # "use server" mutation + read actions, one file per feature
    project.actions.ts
    task.actions.ts
  app/
    (auth)/                # sign-in and sign-up (Clerk), out of the dashboard shell
    (dashboard)/           # auth-protected shell: layout, dashboard, projects
      error.tsx            # route-level error boundary
      dashboard/loading.tsx
      projects/loading.tsx
      projects/[projectId]/loading.tsx
    api/webhooks/clerk/    # Svix-verified webhook Route Handler
    generated/prisma/      # generated Prisma client — never hand-edit
    globals.css            # Tailwind v4 tokens, base styles, focus, reduced motion
    layout.tsx             # root layout: ClerkProvider, Geist fonts
    page.tsx               # marketing landing page
  components/
    dashboard/             # dashboard overview, stats, recent projects
    navigation/            # sidebar, mobile sheet, nav config, brand, account
    project-workspace/     # workspace orchestrator, header, task board, dialogs, types
    projects/              # projects list, list header, create dialog
    ui/                    # shared hand-owned primitives (button, read-error-state)
  lib/
    prisma.ts              # PrismaClient + adapter-pg singleton
    ensure-app-user.ts     # JIT user synchronization fallback
    validations/           # Zod schemas per feature
  proxy.ts                 # Clerk middleware (webhook bypass + matcher)
  types/                   # cross-feature public types (ActionResult, ProjectSummary)
```

- Co-locate feature-specific types with their feature (`src/components/project-workspace/types.ts`). Reserve `src/types/` for genuinely cross-feature contracts.
- Put business rules in Server Actions, not in React components or pages. Components render and delegate.
- Keep secrets and server-only integration code out of client components. `src/lib/prisma.ts` and `src/lib/ensure-app-user.ts` must never be imported into a `"use client"` module.
- `src/app/generated/**` is build output. Never edit it, never import from it in a client component, and never commit manual changes to it.

## React and Next.js

### Component boundaries

- Use functional components only; class components are not permitted.
- Use Server Components by default. Add `"use client"` only for browser APIs, event handlers, local interactive state, or client-only hooks.
- Place the client boundary as low in the tree as possible. `(dashboard)/layout.tsx` stays a Server Component that renders `await auth.protect()`; the client surface starts at components such as `ProjectWorkspace`.
- Pages fetch through Server Actions and branch on the result; they do not fetch their own Route Handlers.
- Keep components focused. Extract repeated stateful behavior into a helper or hook and repeated markup into a component once a reuse boundary is clear.
- Use `next/link` for internal navigation and `next/image` (or a responsive `<picture>`, as the brand logo does) for images.
- Treat loading, error, empty, and unauthorized states as designed states — see the section on errors below.

### Data reads and mutations

- **Server Actions** (`"use server"`) are the only mutation boundary. There is no internal REST layer.
- **Route Handlers** (`route.ts`) exist for external callbacks only — currently just the Clerk webhook. Do not add an internal REST endpoint for app data.
- Fetch authenticated data directly in Server Components through an owner-scoped action. Never fetch the app's own Route Handler from a Server Component.
- Mutations must not be performed in work the browser waits on beyond the action itself. Long-running work must be deferred to a background mechanism before it is introduced.
- Revalidate only the affected paths after a successful mutation. Use optimistic UI only where the rollback path is clear.

#### The Server Action contract

Every action follows the same pipeline. Do not reorder or skip steps:

1. **Auth guard.** `const { userId } = await auth();` and return an unauthorized result if absent.
2. **Validate.** `schema.safeParse(input)`, returning the first issue message on failure.
3. **Ensure the user exists.** `await ensureAppUser(userId)` before creating rows owned by that user.
4. **Ownership-scoped query.** `where: { id, userId }` for projects; `where: { id, project: { userId } }` for tasks. Ownership belongs in the query, never in an after-the-fact check.
5. **Revalidate.** `revalidatePath()` for each affected route — `/dashboard`, `/projects`, and `/projects/[projectId]` as applicable.
6. **Return the standard shape.**

```typescript
// src/types/index.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Additive notes on the existing code:

- `getProjectById` returns an extended error variant carrying a `code` (`"UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL"`), which lets the page choose an error treatment. When a caller needs to distinguish causes, extend the shape this way rather than inventing a second result type.
- `updateProject` and `deleteProject` accept an `id` in the `where` clause directly, so `create()`-style pre-checks are unnecessary; task operations verify the parent project because `create()` has no `where` clause.
- Server Actions call `await auth()` themselves. Never rely on the layout's `auth.protect()` as the only guard for a mutation.

### Route conventions

- Use the `(dashboard)` route group for authenticated pages so the protection lives in one layout.
- Use dynamic segments for detail pages (`/projects/[projectId]`) and always re-resolve ownership server-side.
- Keep filter and view state in the URL when sharing or back/forward behavior matters. The current task-board filter is client state; promote it to the URL if shareable filtered views are requested.
- Prefer `redirect()`/`notFound()` from the server over client-side permission redirects.

## Validation and contracts

- Define a Zod schema for each input boundary: Server Action arguments and webhook payloads. Schemas live in `src/lib/validations/<feature>.schema.ts`.
- Validate and normalize on the server even when the client form validates too. Server Actions call `safeParse` on every call — the fact that the caller is our own client component is not a trust guarantee.
- Never trust client-supplied `userId`, ownership flags, or record IDs for authorization. IDs may identify a record; only the server session authorizes access to it.
- Use `.trim()` and explicit length bounds so persisted data is normalized. Follow the existing limits: project name 1–100, project description ≤ 500; task title 1–200, task description ≤ 1000.
- Derive update schemas with `.partial()` from the create schema rather than duplicating field rules.
- Validate enums with a shared Zod enum (`taskStatusEnum`) and reuse it as the source of the `TaskStatus` type; do not re-declare status literals.
- Return structured, user-safe failures. Do not expose Prisma error text, SQL, or stack traces to the client.

## Database: Neon PostgreSQL and Prisma v7

- Use **Prisma ORM v7 with `@prisma/adapter-pg`**. Do not add Drizzle or another ORM. Do not reintroduce Prisma v6 configuration patterns.
- The schema is `prisma/schema.prisma`; the client is generated to `src/app/generated/prisma`. Regenerate after any schema change.
- Configuration is centralized in `prisma7.config.ts` (`schema`, `migrations.path`, and `process.env.DATABASE_URL`). Keep the datasource URL out of the schema file.
- Use `@map`/`@@map` so PostgreSQL stays `snake_case` while TypeScript stays camelCase.
- Use the cached client singleton from `src/lib/prisma.ts`. Create the adapter once and attach the client to `globalThis` in non-production to survive hot reloads.
- **Migrations:**
  - `prisma db push` is acceptable **only against a local or disposable development database**.
  - Before any shared environment (staging or production), produce reviewed `prisma migrate` migration files committed under `prisma/migrations/`, apply them in order, and promote the same artefacts. Never point `db push` at a shared database.
  - Migrations are immutable once shared or deployed.
  - `README.md` documents this same split in its database setup and deployment steps; keep the two in sync when the workflow changes.
- Use transactions for multi-step invariants. Current write paths are single-row; wrap a future project-plus-tasks or status-plus-audit write in `prisma.$transaction`.
- Webhook handling must be idempotent. `user.updated` can arrive repeatedly, and `upsert` is what makes that safe.
- Enforce structural invariants in the schema: foreign keys with `onDelete: Cascade`, unique constraints where identity requires it (`users.email`), and indexes tied to a real access pattern.
- Deleting a project relies on cascade for its tasks. If deletion ever needs an audit or undo, that becomes an explicit transactional workflow.
- Avoid N+1 reads. The known case is `getProjects()`, which counts completed tasks per project inside `Promise.all`; collapse it into a single grouped count when project counts grow.

### Ownership policy

- Resolve the authenticated user on the server for every protected operation.
- Every project and task lookup is owner-scoped in the query. Do not load by an unscoped ID and check ownership afterwards.
- Verify the parent project belongs to the user before creating a task in it, since `create()` has no `where` clause.
- Do not rely on client-side filtering, URL parameters, or hidden fields for authorization.

## Authentication and identity synchronization

- Use **Clerk** for authentication. Do not introduce a second auth provider or a custom session system.
- Protect route groups server-side with `await auth.protect()` in `src/app/(dashboard)/layout.tsx`. This gives a server redirect with no client-side flash.
- Because Next.js layouts do not re-run on client-side navigation, page-level and action-level checks remain the real authorization boundary. Never treat the layout guard as sufficient on its own.
- `src/proxy.ts` configures `clerkMiddleware`. It deliberately bypasses `/api/webhooks/*`, because those requests are authenticated by Svix signatures rather than a session. Preserve that bypass and the matcher.
- Keep the local `users` row synchronized through **both** layers: the `/api/webhooks/clerk` handler for Clerk lifecycle events (verified with `verifyWebhook` — never parse an unverified payload) and the JIT `ensureAppUser` fallback for first-action and local-development coverage.
- Store Clerk's user ID directly as the primary key. Do not generate a separate internal user ID.

## UI and Tailwind CSS v4

> **Critical:** GitDone uses Tailwind CSS v4's CSS-first configuration.

- Do **not** create `tailwind.config.ts` or `tailwind.config.js`. Theme configuration belongs in `src/app/globals.css` using `@theme inline` and CSS custom properties.
- Use the existing semantic tokens rather than raw hex values: `--background`, `--foreground`, `--brand`, `--brand-hover`, `--brand-soft`, `--brand-text`, `--brand-focus`, exposed as `bg-background`, `text-foreground`, `bg-brand`, `text-brand-text`, and so on. Raw palette values like `#121214` appear in a handful of legacy spots; prefer the token when touching that code.
- **This project has no shadcn/ui and no Radix.** Shared primitives are hand-owned in `src/components/ui`:
  - Model variants as a typed union and a `Record<Variant, string>` class map — see `ButtonVariant`, `ButtonSize`, and `variantClasses` in `button.tsx`.
  - Export a class-building helper (`buttonStyles({ variant, size, className })`) so the same visual language can be applied to a `Link` or a non-`<button>` element without duplicating classes.
  - Default-export the component; keep the variant/size types exported for callers.
  - Reuse the primitive even where a cursor-pointer `<div>` would work. Consistency beats one-off markup.
- Do not use ad hoc inline `style` props. An exception is a genuinely runtime-derived value that cannot be expressed with existing tokens; keep it typed and documented.
- Prefer borders over shadows. Elevated shadow is reserved for dialogs.
- **Dark only.** There is no light theme. Do not wire up a theme toggle or add a `class="dark"` strategy without a product decision.
- Follow the spacing, radius, and typography scale in [`UI_DESIGN_SYSTEM.md`](../UI_DESIGN_SYSTEM.md). Do not invent new tokens for a one-off screen.
- Never use color as the only signal for status or for a destructive action — pair it with a label, an icon, or both.

### Accessibility and interaction

- Use semantic HTML and native elements: `<button>` for actions, `next/link` for navigation, `<main>`/`<section>`/`<h2>` for structure.
- Give every icon-only control an accessible name.
- Give dialogs `role="dialog"` and `aria-modal`, and manage focus on open and close.
- Announce asynchronous failures with `role="alert"` — `ReadErrorState` is the reference implementation.
- Disable a control while its action is pending and expose `aria-busy`, driven by React 19's `useTransition`. Do not rely on a spinner alone to communicate pending state.
- Preserve the global `:focus-visible` indicator defined in `globals.css`; never remove an outline without a visible replacement.
- Respect `prefers-reduced-motion`; motion must never be required to understand a result or complete an action.
- Test the sidebar, mobile navigation sheet, dialogs, and task board at narrow mobile widths as well as desktop.

## Errors, observability, and user feedback

- Anticipate expected failures as returned results. Reserve `try/catch` for operations that can actually throw — Prisma calls and webhook processing — and always handle the specific `Prisma.PrismaClientKnownRequestError` codes already in use:
  - `P2025` → record not found (a user-facing "not found", not a crash)
  - `P2002` → unique violation
  - `P2003` → foreign key violation
- Log server-side failures with `console.error` and enough context to identify the operation (`"Failed to create task:"`). Never log secrets, session tokens, or full webhook payloads.
- Return a safe, generic message for unexpected failures — `"Something went wrong. Please try again."` — while logging the real error server-side.
- The UI maps results to designed states: `ReadErrorState` (`role="alert"` plus a retry) for failed reads, inline form errors for failed writes, and route-level `error.tsx` / `loading.tsx` for boundary and suspense cases.
- Do not surface a raw error string to the user when a specific, actionable message is available.

## Testing and quality gates

- **Automated tests are not configured yet.** Vitest (`*.test.ts` / `*.test.tsx`, co-located with their subject) is the intended runner once it is added; do not describe a test suite that does not exist.
- Until then, the required gate before a pull request is:
  1. `npm run lint`
  2. `npx tsc --noEmit`
  3. `npm run build`
  4. Manual verification of the affected flow in the browser — create, edit, re-status, filter, and delete
- When Vitest is introduced, prioritize: Zod schema behaviour, ownership scoping (a non-owner must not read or mutate a record), the `ActionResult` contract for each action, and webhook idempotency. Mock external boundaries (Clerk, Prisma) — never the business rule under test.
- No commented-out code, unused imports or variables, dead feature flags, or ignored errors.
- When a fix reveals a systemic cause, fix the cause rather than adding a branch for the symptom.
- Aim for functions under roughly 50 lines when that improves clarity. Extract coherent operations, but do not fragment straightforward code to hit a number.

## Pull request checklist

- [ ] The change authenticates with Clerk server-side and scopes every query to the owner.
- [ ] External input is validated with Zod on the server, not only in the client.
- [ ] Mutations return an `ActionResult` and revalidate only the affected paths.
- [ ] A schema change updates `prisma/schema.prisma`, regenerates the client, and — if it targets a shared environment — includes reviewed migration files rather than a `db push`.
- [ ] Webhook, auth, or middleware changes preserve signature verification and the webhook bypass in `src/proxy.ts`.
- [ ] Loading, empty, error, keyboard, and narrow-mobile states were considered; pending controls expose `aria-busy`.
- [ ] Lint, type-check, and build pass, and the affected flow was verified in the browser.
- [ ] No secrets, session tokens, or generated-client edits are included.
- [ ] `project-overview.md` was updated if this changes a documented product or architectural decision.
