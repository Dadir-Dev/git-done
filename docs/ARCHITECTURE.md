# Project Tracker — Architecture Document

**Stack:** Next.js (App Router) · TypeScript · Tailwind + Shadcn UI · PostgreSQL (Supabase/Neon) · Prisma · Clerk · Zod
**Status:** Draft — aligned to MVP scope in PRD v1
**Last Updated:** August 14, 2026

---

## 1. High-Level Architecture Overview

The app uses a **server-first** architecture enabled by the Next.js App Router. There is no separate REST/GraphQL API layer for internal app operations — **Server Actions** act as the API boundary, called directly from Server/Client Components.

### Data Flow

```
┌─────────────┐      invokes       ┌────────────────┐      queries       ┌─────────┐      reads/writes    ┌────────────┐
│   Client    │ ─────────────────▶ │ Server Actions  │ ─────────────────▶ │ Prisma  │ ───────────────────▶ │ PostgreSQL │
│ (RSC / CC)  │ ◀───────────────── │  (actions/*.ts) │ ◀───────────────── │  (ORM)  │ ◀─────────────────── │ (Supabase/ │
└─────────────┘   revalidated data └────────────────┘   typed results    └─────────┘    rows                Neon)      │
                                            │                                                              └────────────┘
                                            │ validates via Zod, auth via Clerk
                                            ▼
                                   ┌──────────────────┐
                                   │  Clerk (auth())   │
                                   └──────────────────┘
```

**Flow, step by step:**

1. **Client** — Server Components fetch data directly (no client-side fetch needed for initial load). Client Components (forms, buttons) call Server Actions imported directly as functions (`"use server"`).
2. **Server Action** — Each action:
   - Authenticates the request via Clerk's `auth()` helper (rejects if no `userId`).
   - Validates input using the corresponding Zod schema.
   - Enforces ownership (a user may only read/write their own `Project`/`Task` records).
   - Calls Prisma to perform the DB operation.
   - Calls `revalidatePath()` / `revalidateTag()` to refresh cached Server Component data.
3. **Prisma** — Typed query layer over PostgreSQL; single shared client instance (see `lib/db.ts`).
4. **PostgreSQL** — Hosted on Supabase or Neon; relational integrity enforced via foreign keys and cascade rules (Section 2).
5. **Clerk** — Owns identity/session. A webhook (`api/webhooks/clerk`) syncs `user.created` / `user.updated` / `user.deleted` events into our local `User` table, so Projects/Tasks can have a normal relational foreign key instead of depending on Clerk at query time.

**Why Server Actions over a REST API:** No API route boilerplate, automatic type-safety end-to-end (input → action → Prisma → UI), colocated with the feature, and no client-side data-fetching library needed for the MVP.

---

## 2. Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────
// Enums
// ──────────────────────────────

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETE
}

// ──────────────────────────────
// Models
// ──────────────────────────────

/// Mirrors the Clerk user. Synced via Clerk webhook, not created directly by app logic.
model User {
  id        String   @id // Clerk userId (e.g. "user_2abc..."), used as-is — no separate internal ID
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
  id          String   @id @default(cuid())
  name        String
  description String?

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks       Task[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([userId, createdAt]) // supports dashboard "most recent first" queries
  @@map("projects")
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)

  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([projectId])
  @@index([projectId, status]) // supports "tasks by status within project" queries
  @@map("tasks")
}
```

**Design notes:**

- **Cascades:** Deleting a `User` cascades to `Project`, which cascades to `Task` — no orphaned rows possible, matches the MVP's "delete project" / account-deletion behavior.
- **IDs:** `User.id` stores the Clerk `userId` directly (no extra join needed on every request). `Project`/`Task` use `cuid()` — collision-resistant, sortable-ish, no DB round-trip to generate like a serial int.
- **No soft deletes in MVP** — deletions are hard deletes, consistent with "Strictly Out-of-Scope" (no audit/history features).
- **Progress % on dashboard** is computed at query time (`COMPLETE tasks / total tasks`), not stored — avoids a denormalized field going stale.

---

## 3. Project Directory Structure

```
project-tracker/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                    # authenticated shell (nav, sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                  # project list / dashboard
│   │   │   └── projects/
│   │   │       └── [projectId]/
│   │   │           └── page.tsx               # project detail + task list
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── clerk/
│   │   │           └── route.ts               # Clerk → User table sync
│   │   ├── layout.tsx                          # root layout (ClerkProvider, fonts, globals)
│   │   ├── page.tsx                            # marketing/landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                                 # shadcn primitives (button, dialog, input, etc.)
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-form.tsx                # create/edit dialog
│   │   │   └── project-list.tsx
│   │   └── tasks/
│   │       ├── task-item.tsx
│   │       ├── task-form.tsx
│   │       └── task-status-select.tsx
│   ├── actions/
│   │   ├── project.actions.ts                  # "use server" — Project CRUD
│   │   └── task.actions.ts                     # "use server" — Task CRUD
│   ├── lib/
│   │   ├── prisma.ts                                # Prisma client singleton
│   │   ├── utils.ts                             # cn(), formatting helpers
│   │   └── validations/
│   │       ├── project.schema.ts                # Zod schemas
│   │       └── task.schema.ts
│   └── types/
│       └── index.ts                             # shared TS types (ActionResult<T>, etc.)
├── proxy.ts                                 # Clerk route protection
├── .env
├── next.config.mjs
├── tailwind.config.ts
├── components.json                               # shadcn config
├── tsconfig.json
└── package.json
```

---

## 4. Core Server Actions Specification

All actions live under `"use server"` files, authenticate via Clerk's `auth()`, validate input with Zod, and return a consistent result shape:

```typescript
// types/index.ts
export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };
```

### `actions/project.actions.ts`

```typescript
"use server";

/** Creates a new project owned by the current user. */
async function createProject(
	input: CreateProjectInput,
): Promise<ActionResult<Project>>;

/** Returns all projects owned by the current user, with task counts for dashboard progress display. */
async function getProjects(): Promise<
	ActionResult<(Project & { taskCount: number; completedCount: number })[]>
>;

/** Returns a single project (with its tasks) if owned by the current user. */
async function getProjectById(
	projectId: string,
): Promise<ActionResult<Project & { tasks: Task[] }>>;

/** Updates a project's name/description. Ownership is verified before the write. */
async function updateProject(
	projectId: string,
	input: UpdateProjectInput,
): Promise<ActionResult<Project>>;

/** Deletes a project (and its tasks, via cascade). Ownership is verified before the write. */
async function deleteProject(projectId: string): Promise<ActionResult<void>>;
```

### `actions/task.actions.ts`

```typescript
"use server";

/** Creates a task within a project. Verifies the parent project belongs to the current user. */
async function createTask(
	projectId: string,
	input: CreateTaskInput,
): Promise<ActionResult<Task>>;

/** Returns all tasks for a project, optionally filtered by status. */
async function getTasksByProject(
	projectId: string,
	status?: TaskStatus,
): Promise<ActionResult<Task[]>>;

/** Updates a task's title/description/status. Ownership verified via the parent project's userId. */
async function updateTask(
	taskId: string,
	input: UpdateTaskInput,
): Promise<ActionResult<Task>>;

/** Convenience action for the common case: just flipping status (e.g. checkbox toggle in UI). */
async function updateTaskStatus(
	taskId: string,
	status: TaskStatus,
): Promise<ActionResult<Task>>;

/** Deletes a task. Ownership verified via the parent project's userId. */
async function deleteTask(taskId: string): Promise<ActionResult<void>>;
```

**Ownership check pattern (applies to every action above):** since `Task` has no direct `userId`, ownership is verified by joining through `project.userId === auth().userId` in the `where` clause of the Prisma query itself (not as a separate check) — this ensures a user can never even probe for the existence of another user's data via ID guessing.

---

## 5. Validation Schemas (Zod)

### `lib/validations/project.schema.ts`

```typescript
import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string().trim().min(1, "Project name is required").max(100),
	description: z.string().trim().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

### `lib/validations/task.schema.ts`

```typescript
import { z } from "zod";

export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETE"]);

export const createTaskSchema = z.object({
	title: z.string().trim().min(1, "Task title is required").max(200),
	description: z.string().trim().max(1000).optional(),
	status: taskStatusEnum.default("TODO"),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
```

**Validation flow:** Server Actions call `.parse()` (or `.safeParse()`) on incoming input before touching Prisma. On failure, the action returns `{ success: false, error: <message> }` rather than throwing, so Client Components can render inline form errors without a try/catch wrapper.

---

## 6. Explicitly Deferred (Architecture-Level)

Consistent with the PRD's out-of-scope list, this architecture **intentionally excludes**:

- Any REST/GraphQL API layer (Server Actions only)
- Role/permission tables (single-owner model — `Project.userId` is the only access control needed)
- Soft-delete columns, audit logs, or history tables
- Real-time sync (websockets/polling) — data refreshes via Next.js cache revalidation on mutation only
- File storage buckets (no attachments in MVP)

These can be layered in later without a schema rewrite — e.g., adding a `ProjectMember` join table for collaboration is additive, not a breaking change to the models above.
