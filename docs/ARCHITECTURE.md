# GitDone — Architecture Document

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Neon PostgreSQL · Prisma ORM v7 (`@prisma/adapter-pg`) · Clerk Auth · Zod v4  
**Status:** Completed MVP (Production Architecture)  
**Last Updated:** October 2026  
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
  id          String   @id @default(cuid())
  name        String
  description String?

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks       Task[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([userId, createdAt]) // supports dashboard ordering
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
  @@index([projectId, status]) // supports status filtering within project
  @@map("tasks")
}
```

### Key Schema Design Decisions:
- **Foreign Key Cascades:** Deleting a `User` cascades to `Project`, which cascades to all associated `Task` records.
- **Direct Clerk IDs:** `User.id` stores Clerk's unique ID directly, preventing duplicate identity lookup queries.
- **Computed Progress Metrics:** Task counts and completion ratios are calculated dynamically at query time (`COMPLETE` tasks vs. total tasks), avoiding stale denormalized columns.

---

## 3. Project Directory Structure

```
git-done/
├── prisma/
│   └── schema.prisma                    # Prisma ORM schema
├── prisma7.config.ts                    # Prisma 7 configuration & datasource url
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
  - Validates name and description.
  - Ensures user exists via `ensureAppUser`.
  - Creates project and revalidates `/dashboard` and `/projects`.
- `getProjects(): Promise<ActionResult<ProjectSummary[]>>`
  - Returns user's projects with calculated `taskCount` and `completedCount`.
- `getProjectById(projectId: string): Promise<ActionResult<Project & { tasks: Task[] }>>`
  - Returns a project with all its tasks, scoped to the authenticated user.
- `updateProject(projectId: string, input: UpdateProjectInput): Promise<ActionResult<Project>>`
  - Updates project details and revalidates `/dashboard`, `/projects`, and `/projects/[projectId]`.
- `deleteProject(projectId: string): Promise<ActionResult<void>>`
  - Deletes project (cascading to tasks) and revalidates dashboard and projects paths.

### `actions/task.actions.ts`

- `createTask(projectId: string, input: CreateTaskInput): Promise<ActionResult<Task>>`
  - Confirms parent project ownership before insertion.
  - Creates task and revalidates `/dashboard`, `/projects`, and `/projects/[projectId]`.
- `getTasksByProjectId(projectId: string, status?: TaskStatus): Promise<ActionResult<Task[]>>`
  - Fetches tasks for a project filtered by ownership and optional status.
- `updateTask(taskId: string, input: UpdateTaskInput): Promise<ActionResult<Task>>`
  - Updates task title, description, or status through project ownership verification.
- `updateTaskStatus(taskId: string, status: TaskStatus): Promise<ActionResult<Task>>`
  - Fast status toggle (TODO / IN_PROGRESS / COMPLETE).
- `deleteTask(taskId: string): Promise<ActionResult<void>>`
  - Deletes task and revalidates project workspace.

---

## 5. Validation Schemas (Zod)

### `lib/validations/project.schema.ts`
- **Name:** Required string, 1–100 characters, trimmed.
- **Description:** Optional string, up to 500 characters, trimmed.

### `lib/validations/task.schema.ts`
- **Title:** Required string, 1–200 characters, trimmed.
- **Description:** Optional string, up to 1000 characters, trimmed.
- **Status:** Enum: `TODO`, `IN_PROGRESS`, `COMPLETE` (defaults to `TODO`).

---

## 6. Security, Isolation & Multi-Tenancy

- **Hard Multi-Tenancy:** Projects and Tasks are strictly filtered by Clerk `userId` on every read and write. No cross-tenant data leaks are possible.
- **CSRF & Injection Protection:** Next.js Server Actions enforce POST-only execution with native origin checks. Parameterized queries via Prisma prevent SQL injection.
- **Webhook Integrity:** Clerk webhooks verify incoming cryptographic signatures using `@clerk/nextjs/webhooks` and `CLERK_WEBHOOK_SIGNING_SECRET`.
