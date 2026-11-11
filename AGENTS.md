<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GitDone — Agent Instructions

These instructions are mandatory for every task in this repository, including small fixes and questions that lead to code changes. Read the required documents in full before planning, editing, or running commands that change the project.

## Required reading (in this order)

1. [`context/ai-interaction.md`](context/ai-interaction.md) — **mandatory.** The workflow, communication rules, branching, commit policy, and the "ask first" boundaries. Follow this for every feature or fix.
2. [`context/coding-standards.md`](context/coding-standards.md) — **mandatory.** The engineering conventions: TypeScript, naming, module layout, Server Actions, validation, database, auth, UI/Tailwind, accessibility, error handling, and the pull-request checklist. This file is binding; do not introduce a pattern it forbids.
3. [`context/project-overview.md`](context/project-overview.md) — product vision, scope, architecture summary, and data model.
4. [`context/current-feature.md`](context/current-feature.md) — the feature in flight and its history. Add or update the entry before implementing, and mark it completed after verification.

If a required document is missing or contradicts the code, stop and ask rather than guessing. If a change alters a documented decision, update the affected documents in the same change.

## Task-specific references

Open the files that match the work. Do not rely on memory or training data for these areas.

| When the task touches | Read first |
| --- | --- |
| Product scope, requirements, acceptance criteria | [`docs/git-done-prd.md`](docs/git-done-prd.md), [`context/project-overview.md`](context/project-overview.md) |
| App structure, routing, data flow, action contracts | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Colors, spacing, radii, typography, component styling | [`UI_DESIGN_SYSTEM.md`](UI_DESIGN_SYSTEM.md), [`src/app/globals.css`](src/app/globals.css) |
| Server Actions and mutations | [`src/actions/project.actions.ts`](src/actions/project.actions.ts), [`src/actions/task.actions.ts`](src/actions/task.actions.ts), [`src/types/index.ts`](src/types/index.ts) |
| Zod schemas and validation | [`src/lib/validations/`](src/lib/validations), the matching `<feature>.schema.ts` |
| Prisma schema, migrations, generated client | [`prisma/schema.prisma`](prisma/schema.prisma), [`prisma7.config.ts`](prisma7.config.ts), [`prisma/migrations/`](prisma/migrations), [`src/lib/prisma.ts`](src/lib/prisma.ts) |
| Auth, sessions, user sync, middleware | [`src/proxy.ts`](src/proxy.ts), [`src/app/(dashboard)/layout.tsx`](src/app/(dashboard)/layout.tsx), [`src/lib/ensure-app-user.ts`](src/lib/ensure-app-user.ts), [`src/app/api/webhooks/clerk/route.ts`](src/app/api/webhooks/clerk/route.ts) |
| Scripts, dependencies, versions | [`package.json`](package.json), [`README.md`](README.md) |
| Local setup, environment variables, deployment | [`README.md`](README.md) |
| Version-specific Next.js behavior | `node_modules/next/dist/docs/` (see the block above) |
| Neon and Prisma skills/workflows | [`.agents/skills/`](.agents/skills) — load the matching skill before using its CLI or APIs |

## Non-negotiables

These are a quick reminder, not a replacement for `context/coding-standards.md`. If they disagree, the standards file wins.

- **Server-first.** React Server Components by default; add `"use client"` only for browser APIs, event handlers, local state, or client-only hooks, and keep the boundary as low as possible.
- **Server Actions are the only mutation boundary.** No internal REST endpoints. Every action returns the typed `ActionResult` contract and revalidates only the affected paths.
- **Authenticate and scope in the query.** Call `await auth()` in every protected action; never trust client-supplied `userId` or IDs. Ownership belongs in the `where` clause, not an after-the-fact check.
- **Validate at boundaries with Zod** on the server, even when the client validates too. Use `z.input` for defaulted schemas and `z.infer` for parsed types.
- **Prisma v7 only**, with `@prisma/adapter-pg` and the cached singleton in `src/lib/prisma.ts`. Never edit `src/app/generated/prisma`. Never run `db push` against a shared database.
- **Tailwind v4 CSS-first.** No `tailwind.config.*`. Use semantic tokens in `src/app/globals.css`. No shadcn/ui, no Radix, dark theme only.
- **Accessibility is acceptance criteria.** Semantic elements, accessible names, `role="alert"` for async failures, `aria-busy` for pending controls, preserved `:focus-visible`, reduced-motion support.
- **Verify before claiming done:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, plus manual browser verification of the affected flow. There is no test suite yet.
- **Ask before committing.** Never commit or push without permission. Use conventional commit messages and one feature/fix per commit.
- **Minimal, in-pattern changes.** Do not refactor unrelated code, add unrequested features, or delete files without confirmation.

## Workflow

Follow the ten-step loop in `context/ai-interaction.md` (document → branch → implement → verify → iterate → commit → merge → delete branch → review → record history). Do not skip step 1 or the verification gate.
