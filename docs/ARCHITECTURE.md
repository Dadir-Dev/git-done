# GitDone — Architecture Document

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Neon PostgreSQL · Prisma ORM v7 (`@prisma/adapter-pg`) · Clerk Auth · Zod v4 · Vitest
**Status:** Completed MVP (Production Architecture)
**Last Updated:** November 28, 2026
**Live Demo:** [git-done-dadirdev.vercel.app](https://git-done-dadirdev.vercel.app/)

---

## 1. High-Level Architecture Overview

GitDone follows a **server-first, zero-REST architecture** enabled by Next.js 16 App Router. There is no separate API layer for internal application mutations — Next.js **Server Actions** (`"use server"`) act as the secure, type-safe RPC boundary called directly from Server and Client Components.

### Data Flow Diagram

```
┌─────────────────────────────────┐
│       Next.js 16 Client         │
│  (React Server & Client Comps)  │
└─────────────────────────────────┘
          │                 ▲
          │ Invokes         │ Revalidates Path
          ▼                 │
┌─────────────────────────────────┐
│     Server Actions Layer        │
│  (src/actions/*.actions.ts)     │
├─────────────────────────────────┤
│ 1. Clerk auth() / auth.protect()│
│ 2. Zod Schema Validation        │
│ 3. ensureAppUser (JIT fallback) │
│ 4. Multi-tenant Ownership Query │
│ 5. revalidatePath() Invalidator │
└─────────────────────────────────┘
          │
          │ Queries via @prisma/adapter-pg
          ▼
┌─────────────────────────────────┐
│      Prisma ORM Client v7       │
│ (src/app/generated/prisma/...)  │
└─────────────────────────────────┘
          │
          │ Pooled TCP Connection
          ▼
┌─────────────────────────────────┐
│    Neon Serverless PostgreSQL   │
│   (users, projects, tasks)      │
└─────────────────────────────────┘
          ▲
          │ Webhook Event (user.created / updated / deleted)
┌─────────────────────────────────┐
│       Clerk Auth Service        │
│  (/api/webhooks/clerk via Svix) │
└─────────────────────────────────┘
```

### Architectural Principles & Flow:

1. **Server-Side Route Protection:** Unauthenticated requests to `/(dashboard)/*` are intercepted server-side via `await auth.protect()` in the layout, eliminating client-side flash and unnecessary rendering.
2. **Server Actions RPC Boundary:**
   - Authenticates via Clerk's `auth()` helper.
   - Validates input using Zod schemas (`src/lib/validations/*.schema.ts`).
   - Ensures user presence via `ensureAppUser(userId)` JIT synchronization.
   - Enforces user isolation directly within Prisma queries (`where: { id, userId }` or `where: { id, project: { userId } }`).
   - Revalidates cached Next.js route data via `revalidatePath()`.
3. **Prisma v7 with Driver Adapters:** Uses `@prisma/adapter-pg` connecting to Neon PostgreSQL with connection pooling. Configuration is driven by `prisma7.config.ts` and generated into `@/src/app/generated/prisma`.
4. **Dual-Layer Identity Synchronization:**
   - **Layer 1 (Asynchronous Webhook):** Clerk sends signed webhooks to `/api/webhooks/clerk`, verified with Svix to keep the `User` table synced.
   - **Layer 2 (Just-In-Time Fallback):** When a user performs their first action, `ensureAppUser(userId)` creates or updates the local `User` record from Clerk's `currentUser()` if not already synced, ensuring zero failure during initial project creation or local development.

---

## 2. Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/app/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ──────────────────────────────
// Enums
// ──────────────────────────────

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

// ──────────────────────────────
// Models
// ──────────────────────────────

/// Mirrors the Clerk user. Synced via Clerk webhook and JIT ensureAppUser fallback.
model User {
  id        String   @id // Clerk userId (e.g. "user_2abc..."), used directly as PK
  email     String   @unique
  name      String?
  imageUrl  String?

  projects  Project[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")
}

model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  dueDate     DateTime? @db.Date

  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks       Task[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
  @@index([userId, createdAt]) // supports dashboard ordering
  @@map("projects")
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime?    @db.Date
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)

  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([projectId])
  @@index([projectId, status]) // supports status filtering within project
  @@map("tasks")
}
```

### Key Schema Design Decisions:
- **Foreign Key Cascades:** Deleting a `User` cascades to `Project`, which cascades to all associated `Task` records.
- **Direct Clerk IDs:** `User.id` stores Clerk's unique ID directly, preventing duplicate identity lookup queries.
- **Computed Progress Metrics:** Task counts and completion ratios are calculated dynamically at query time (`COMPLETE` tasks vs. total tasks), avoiding stale denormalized columns.
- **Date-only columns:** `Project.dueDate` and `Task.dueDate` are `@db.Date`, so they store a calendar day with no time component. The wire format is a `YYYY-MM-DD` string, validated and normalized by `src/lib/validations/date-only.schema.ts`.
- **Fixed enums:** `TaskStatus` and `TaskPriority` are database enums, so the set of values cannot drift from the code.

---

## 3. Project Directory Structure

```
git-done/
├── prisma/
│   ├── schema.prisma                    # Prisma ORM schema
│   ├── seed.ts                          # Development/preview seed data
│   └── migrations/                      # Committed migration files
├── prisma7.config.ts                    # Prisma 7 configuration & datasource url
├── scripts/
│   ├── migrate-decision.mjs             # Decides whether a build may run migrate deploy
│   └── migrate-on-deploy.mjs            # Runs migrate deploy during the Vercel build
├── tests/
│   ├── unit/                            # Schema & pure-logic tests (no DB, no auth)
│   ├── integration/                     # Database-backed Server Action tests
│   └── setup.ts                         # Loads .env.test / .env for the test run
├── .github/workflows/ci.yml             # Typecheck, lint, and test on every PR
├── vitest.config.ts                     # Vitest configuration
├── public/
│   ├── git-done_remove-bg_.png          # Brand logo
│   └── screenshots/                     # Product interface screenshots
├── src/
│   ├── actions/
│   │   ├── project.actions.ts           # "use server" — Project CRUD & progress aggregations
│   │   └── task.actions.ts              # "use server" — Task CRUD & status mutation
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/  # Clerk sign-in page with dark UI appearance
│   │   │   └── sign-up/[[...sign-up]]/  # Clerk sign-up page with dark UI appearance
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # Server-side auth.protect(), desktop sidebar & mobile nav
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Workspace dashboard & high-level stats
│   │   │   └── projects/
│   │   │       ├── page.tsx             # All projects list view
│   │   │       └── [projectId]/
│   │   │           └── page.tsx         # Project workspace & task board
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── clerk/
│   │   │           └── route.ts         # Svix webhook handler for Clerk user events
│   │   ├── generated/
│   │   │   └── prisma/                  # Prisma 7 generated client output
│   │   ├── globals.css                  # Tailwind v4 theme variables & base styles
│   │   ├── layout.tsx                   # Root layout (ClerkProvider, Geist fonts)
│   │   └── page.tsx                     # Landing page with hero and interactive preview
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── dashboard-overview.tsx   # Dashboard header & container
│   │   │   ├── dashboard-stats.tsx      # Stat cards (Projects, Tasks ratio, Progress %)
│   │   │   └── recent-projects-section.tsx # Recent projects list on dashboard
│   │   ├── navigation/
│   │   │   ├── active-nav-link.tsx      # Segment/exact route active state styling
│   │   │   ├── desktop-sidebar.tsx      # Fixed 250px desktop navigation bar
│   │   │   ├── mobile-menu-toggle.tsx   # Mobile hamburger toggle
│   │   │   ├── mobile-navigation.tsx    # Mobile slide-out sheet drawer
│   │   │   ├── navigation-config.ts     # Navigation links definition
│   │   │   ├── navigation-links.tsx     # Nav link renderer
│   │   │   ├── sidebar-account.tsx      # Clerk UserButton wrapper & user display name
│   │   │   ├── sidebar-brand.tsx        # Logo & branding mark
│   │   │   └── sidebar-content.tsx      # Shared navigation content
│   │   ├── project-workspace/
│   │   │   ├── project-dialogs.tsx      # Add task, edit project, delete project dialogs
│   │   │   ├── project-header.tsx       # Workspace header with action buttons
│   │   │   ├── project-workspace.tsx    # Client orchestrator with useTransition
│   │   │   ├── task-board.tsx           # Grouped status sections & filter tabs
│   │   │   └── types.ts                 # Workspace specific TypeScript types
│   │   └── projects/
│   │       ├── project-dialog.tsx       # Modal form for creating a new project
│   │       ├── projects-list-header.tsx # Projects page header & "New project" button
│   │       ├── projects-list-workspace.tsx # Projects state container
│   │       └── projects-list.tsx        # Project list items with progress bars
│   ├── lib/
│   │   ├── ensure-app-user.ts           # JIT user synchronization fallback
│   │   ├── prisma.ts                    # PrismaPg client singleton
│   │   └── validations/
│   │       ├── date-only.schema.ts      # Shared YYYY-MM-DD wire schema ("", null handling)
│   │       ├── project.schema.ts        # Zod schemas for projects
│   │       └── task.schema.ts           # Zod schemas for tasks
│   ├── proxy.ts                         # Clerk middleware configuration
│   └── types/
│       └── index.ts                     # Shared types (ActionResult<T>, ProjectSummary)
├── package.json
└── tsconfig.json
```

---

## 4. Server Actions Specification

All actions live under `"use server"`, enforce authentication, validate payloads via Zod, and return a standardized result shape:

```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### `actions/project.actions.ts`

- `createProject(input: CreateProjectInput): Promise<ActionResult<Project>>`
  - Validates name, description, and optional `dueDate`.
  - Ensures user exists via `ensureAppUser`.
  - Converts the `YYYY-MM-DD` string to a `Date` (or `null`) and revalidates `/dashboard` and `/projects`.
- `getProjects(): Promise<ActionResult<ProjectSummary[]>>`
  - Returns user's projects with calculated `taskCount` and `completedCount`, and the `dueDate` sliced to `YYYY-MM-DD`.
- `getProjectById(projectId: string): Promise<{ success: true; data: ProjectDetail } | { success: false; code: "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL"; error: string }>`
  - Returns a project with all its tasks, scoped to the authenticated user. Dates are sliced to `YYYY-MM-DD` at this boundary.
- `updateProject(projectId: string, input: UpdateProjectInput): Promise<ActionResult<Project>>`
  - Updates project details (including an optional `dueDate`); an omitted `dueDate` is left unchanged. Revalidates `/dashboard`, `/projects`, and `/projects/[projectId]`.
- `deleteProject(projectId: string): Promise<ActionResult<void>>`
  - Deletes project (cascading to tasks) and revalidates dashboard and projects paths.

### `actions/task.actions.ts`

- `createTask(projectId: string, input: CreateTaskInput): Promise<ActionResult<Task>>`
  - Confirms parent project ownership before insertion.
  - Accepts `dueDate` (converted to a `Date` or `null`) and `priority` (defaults to `MEDIUM`), then revalidates `/dashboard`, `/projects`, and `/projects/[projectId]`.
- `getTasksByProjectId(projectId: string, status?: TaskStatus): Promise<ActionResult<Task[]>>`
  - Fetches tasks for a project filtered by ownership and optional status.
- `updateTask(taskId: string, input: UpdateTaskInput): Promise<ActionResult<Task>>`
  - Updates task title, description, due date, priority, or status through project ownership verification.
- `updateTaskStatus(taskId: string, status: TaskStatus): Promise<ActionResult<Task>>`
  - Fast status toggle (TODO / IN_PROGRESS / COMPLETE).
- `deleteTask(taskId: string): Promise<ActionResult<void>>`
  - Deletes task and revalidates project workspace.

> [!NOTE]
> The mutation actions still return Prisma storage types (`Project`, `Task`), so a returned `dueDate` is a `Date | null` rather than a wire string. This is tracked in [`context/project-overview.md`](../context/project-overview.md) under "Known follow-ups and discrepancies"; the read actions already slice to `YYYY-MM-DD`.

---

## 5. Validation Schemas (Zod)

### `lib/validations/date-only.schema.ts`
- Shared wire format for `@db.Date` columns. `dateOnlySchema` checks shape (`YYYY-MM-DD`) and then existence, so `2026-02-30` is rejected instead of rolling forward.
- `dateOnlyWireSchema` wraps it as a nullable field that maps the empty string (`""`) to `null`, which is how a blank date input is cleared.

### `lib/validations/project.schema.ts`
- **Name:** Required string, 1–100 characters, trimmed.
- **Description:** Optional string, up to 500 characters, trimmed.
- **Due date:** Optional `dateOnlyWireSchema`.

### `lib/validations/task.schema.ts`
- **Title:** Required string, 1–200 characters, trimmed.
- **Description:** Optional string, up to 1000 characters, trimmed.
- **Due date:** Optional `dateOnlyWireSchema`.
- **Priority:** Enum: `LOW`, `MEDIUM`, `HIGH` (optional; the column defaults to `MEDIUM`).
- **Status:** Enum: `TODO`, `IN_PROGRESS`, `COMPLETE` (defaults to `TODO`). Exported as `taskStatusEnum` / `TaskStatus`; priority is exported as `taskPriorityEnum` / `TaskPriority`.

---

## 6. Security, Isolation & Multi-Tenancy

- **Hard Multi-Tenancy:** Projects and Tasks are strictly filtered by Clerk `userId` on every read and write. No cross-tenant data leaks are possible.
- **CSRF & Injection Protection:** Next.js Server Actions enforce POST-only execution with native origin checks. Parameterized queries via Prisma prevent SQL injection.
- **Webhook Integrity:** Clerk webhooks verify incoming cryptographic signatures using `@clerk/nextjs/webhooks` and `CLERK_WEBHOOK_SIGNING_SECRET`.

---

## 7. Testing & CI

Vitest is the test runner. Configuration lives in `vitest.config.ts` (Node environment, `tests/**/*.test.ts`, `tests/setup.ts` as the setup file), and `npm test` runs the suite once while `npm run test:watch` runs it in watch mode.

- **Unit tests (`tests/unit/`)** — pure logic and Zod schema behaviour. They must not touch the database or auth. Existing files cover the date-only/project/task schemas, the migrate decision helper, and a smoke test.
- **Integration tests (`tests/integration/`)** — database-backed Server Action tests (project due date, task due date, task priority). They mock Clerk's `auth` and `next/cache`, and run against a real Postgres. `tests/setup.ts` loads `.env.test` (falling back to `.env`); shell variables win over both.
- **CI (`.github/workflows/ci.yml`)** — on every pull request and push to `main`, a disposable `postgres:17` service is started, the Prisma client is generated, migrations are applied, Next.js route types are generated, then `npx tsc --noEmit`, `npm run lint`, and `npm test` run. The job installs with `npm install` (not `npm ci`) until the lockfile is regenerated on Linux.

---

## 8. Deployment & Migrations

- `vercel-build` runs `prisma generate`, then `scripts/migrate-on-deploy.mjs`, then `next build`.
- `scripts/migrate-on-deploy.mjs` calls `shouldMigrate` from `scripts/migrate-decision.mjs`: production migrates production, a preview build migrates only when it points at the `preview` branch (`NEON_BRANCH=preview`), and any other environment skips with a warning. This guarantees an unmerged preview build can never change the production schema.
- Migrations are generated on the `development` branch with `npm run db:migrate`, reviewed, and committed under `prisma/migrations/`. `prisma db push` is never run against a shared database.
- The datasource URL for migrations resolves `DIRECT_URL` → `DATABASE_URL_UNPOOLED` → `DATABASE_URL` (`prisma7.config.ts`), so a direct connection is used for `migrate deploy` while the app connects through `DATABASE_URL`.
