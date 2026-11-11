<div align="center">
  <img src="public/git-done_remove-bg_.png" alt="GitDone Logo" width="220" />

  <p align="center">
    <strong>A calm, dark workspace for moving meaningful work to done.</strong>
  </p>

  <p align="center">
    <a href="https://git-done-dadirdev.vercel.app/"><strong>Live Demo »</strong></a> ·
    <a href="https://github.com/Dadir-Dev/git-done/issues"><strong>Report a Bug / Give Feedback »</strong></a> ·
    <a href="#-getting-started"><strong>Quickstart »</strong></a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-v7-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat-square&logo=postgresql" alt="Neon Postgres" />
    <img src="https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square&logo=clerk" alt="Clerk" />
    <img src="https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img alt="zod" src="https://img.shields.io/badge/Zod-v4-000000?style=flat-square&logo=zod" />
  </p>
</div>

---

## 📖 Overview

**GitDone** is a minimalist, high-performance project and task tracking application tailored for developers, freelancers, and solo creators. 

Unlike heavy project management tools with steep learning curves, GitDone keeps you focused on the core productivity loop: **Create a project &rarr; Add actionable tasks &rarr; Move work to completion.**

### ✨ Key Highlights

- 🌑 **Tailored Dark Aesthetics:** Inspired by Linear's clarity and Notion's personal workspace feel with emerald accents (`#34D399`).
- ⚡ **Zero-REST Server Actions:** Instant mutations and cache revalidations directly via Next.js 16 Server Actions.
- 🔒 **Multi-Tenant Security:** Server-side route guarding with Clerk `auth.protect()` and query-level user isolation.
- 🔄 **Resilient Dual-Layer User Sync:** Clerk Webhook (`/api/webhooks/clerk`) backed by just-in-time `ensureAppUser` fallback.
- 📱 **Fully Responsive:** Fluid desktop sidebar, slide-out mobile drawer sheet, and accessible modal dialogs.

---

## Product Status


### ✅ Current Scope

The MVP includes the core workflow for managing meaningful work end-to-end:

- Project creation, editing, and deletion with user-scoped data isolation
- Task creation, status updates, filtering, and deletion
- Kanban-style status grouping for **To Do**, **In Progress**, and **Complete**
- Dashboard overview with workspace metrics and recent project activity
- Secure authentication and protected app routes with Clerk
- Responsive dark UI optimized for desktop and mobile workflows
- Neon + Prisma backend with server-first data handling and cache revalidation

### 🚀 Planned Roadmap

The immediate next phase is focused on deeper workflow and collaboration features:

- Drag-and-drop task board interactions
- Due dates, milestones, and reminder-style planning
- Labels, priorities, and richer task categorization
- Search, sorting, and enhanced filtering across projects and tasks
- Shared workspaces and multi-user collaboration
- Activity history, audit trails, and richer project insights
- Keyboard shortcuts and workflow acceleration features

> GitDone is intentionally scoped as a focused MVP for execution-first productivity, with roadmap work designed to expand beyond the core solo-operator workflow.

---

## Interface Preview

### Dashboard Overview
> *At-a-glance workspace statistics: total projects, completed task counts, overall completion rate, and recent projects.*

![GitDone Dashboard](public/screenshots/GitDone%20-%20dashboard-page.png)

### Projects Workspace
> *Clean project listing with dynamic progress bars and instant creation dialog.*

![GitDone Projects List](public/screenshots/GitDone%20-%20projects-list-page.png)

### Focused Task Board & Status Filtering
> *Grouped status sections (`To do`, `In progress`, `Complete`), inline status dropdowns, deletion actions, and client-side filter tabs.*

![GitDone Project Workspace](public/screenshots/GitDone%20-%20project-page.png)

---

## 🛠️ Tech Stack

| Layer              | Technology                                       | Description                                                |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router)   | React Server Components, Server Actions, Dynamic routing   |
| **UI Library**     | [React 19](https://react.dev/)                   | Actions, `useTransition` pending states, Server Components |
| **Language**       | [TypeScript 5](https://www.typescriptlang.org/)  | End-to-end type safety                                     |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/)      | Modern `@theme inline` variables, dark-mode first          |
| **Database**       | [Neon Serverless PostgreSQL](https://neon.tech/) | Cloud-native Postgres with connection pooling              |
| **ORM**            | [Prisma v7](https://www.prisma.io/)              | `@prisma/adapter-pg` driver adapter architecture           |
| **Authentication** | [Clerk](https://clerk.com/)                      | Social & email auth, session management, Webhooks          |
| **Validation**     | [Zod v4](https://zod.dev/)                       | Schema validation for all server mutations                 |
| **Icons**          | [Lucide React](https://lucide.dev/)              | Accessible icon system                                     |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/) or your preferred package manager
- A free account on [Neon](https://neon.tech/) (for PostgreSQL)
- A free account on [Clerk](https://clerk.com/) (for Authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/Dadir-Dev/git-done.git
cd git-done
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The project uses three Neon branches and one Vercel project:

| Environment | Neon branch | Clerk instance | Variables live in |
| --- | --- | --- | --- |
| Local development | `development` | Development (`pk_test_...`) | `.env` |
| Vercel Preview | `preview` | Development (`pk_test_...`) | Vercel -> Preview |
| Vercel Production | `production` | Development until a custom domain is ready | Vercel -> Production |

Create a `.env` file for local development:

```env
# ── Database (Neon PostgreSQL) ──
# Local app traffic may use the direct URL. Deployed environments use the pooled URL.
DATABASE_URL="postgresql://<user>:<password>@<neon-direct-host>/neondb?sslmode=require&channel_binding=require"
DATABASE_URL_POOLED="postgresql://<user>:<password>@<neon-pooler-host>/neondb?sslmode=require&channel_binding=require"
DATABASE_URL_UNPOOLED="postgresql://<user>:<password>@<neon-direct-host>/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://<user>:<password>@<neon-direct-host>/neondb?sslmode=require&channel_binding=require"
NEON_BRANCH="development"

# ── Seed data (development and preview only) ──
SEED_USER_ID="user_..."
SEED_USER_EMAIL="you@example.com"
SEED_USER_NAME="Your Name"

# ── Authentication (Clerk) ──
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# ── Clerk Webhook (Optional for local dev, recommended for prod) ──
CLERK_WEBHOOK_SIGNING_SECRET="whsec_..."
```

> `DIRECT_URL` is optional locally because `prisma7.config.ts` falls back to
> `DATABASE_URL_UNPOOLED` and then `DATABASE_URL`. It is required on Vercel so
> `prisma migrate deploy` uses a direct connection instead of the pooled one.

### 4. Setup Database & Prisma v7

Generate the Prisma 7 client (configured via `prisma7.config.ts`):

```bash
npm run db:generate
```

Apply migrations:

```bash
# Fresh branch with no schema yet
npm run db:deploy

# Existing database that already has the schema but no Prisma migration history
# (run once per branch; records the baseline as applied without re-running it)
npx prisma migrate resolve --applied 20261111195000_init --config prisma7.config.ts

# New schema change (run on the development branch only)
npm run db:migrate -- --name <migration-name>

# Check migration state for the current DATABASE_URL
npm run db:status
```

Seed development or preview with realistic projects and tasks:

```bash
npm run db:seed

# Recreate the seed projects from scratch:
SEED_RESET=true npm run db:seed
```

To run a command against a specific Neon branch, point both database variables at
that branch for the current shell. For example, on PowerShell:

```powershell
$env:DATABASE_URL = npx neonctl connection-string preview --project-id <project-id>
$env:DIRECT_URL = $env:DATABASE_URL
npm run db:deploy
```

> [!IMPORTANT]
> `prisma db push` must never be run against a shared or production database. It applies the
> schema without producing a migration, so the database can drift from what is committed.
>
> Shared environments (preview, production) must be changed only through reviewed migration
> files committed under `prisma/migrations/` and applied with `prisma migrate deploy`. Generate
> them on `development` with `prisma migrate dev`, review the SQL, and promote the same
> artifacts to every environment. Migrations are immutable once shared or deployed.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Architecture

```
git-done/
├── prisma/
│   └── schema.prisma            # Prisma schema (User, Project, Task models)
├── prisma7.config.ts            # Prisma 7 driver adapter & database configuration
├── public/                      # Static assets, logo, screenshots
├── src/
│   ├── actions/                 # Next.js Server Actions ("use server")
│   │   ├── project.actions.ts   # Project CRUD & stats aggregation
│   │   └── task.actions.ts      # Task CRUD & status update actions
│   ├── app/                     # Next.js 16 App Router
│   │   ├── (auth)/              # Clerk sign-in / sign-up routes
│   │   ├── (dashboard)/         # Authenticated dashboard & projects pages
│   │   ├── api/webhooks/clerk/  # Clerk user sync webhook endpoint
│   │   ├── globals.css          # Tailwind CSS v4 variables & base reset
│   │   └── page.tsx             # Marketing landing page
│   ├── components/
│   │   ├── dashboard/           # Stats cards and recent projects UI
│   │   ├── navigation/          # Desktop sidebar & mobile navigation drawer
│   │   ├── project-workspace/   # Task board, filter tabs & dialogs
│   │   └── projects/            # Projects list & creation modal
│   ├── lib/
│   │   ├── ensure-app-user.ts   # JIT fallback user synchronization
│   │   ├── prisma.ts            # Prisma client singleton with @prisma/adapter-pg
│   │   └── validations/         # Zod schemas for input validation
│   ├── proxy.ts                 # Clerk middleware configuration
│   └── types/                   # Shared TypeScript definitions
```

---

## 🚢 Deployment Guide

### Deploying to Vercel

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Import the repository** into [Vercel](https://vercel.com/new).
3. **Create the Neon branches** (one project, three branches):

   ```bash
   # production is the default branch; development and preview are schema-only children
   npx neonctl branches create --project-id <project-id> --name development --parent production --schema-only
   npx neonctl branches create --project-id <project-id> --name preview --parent production --schema-only
   ```

4. **Set the Environment Variables** in Vercel Project Settings. Use the pooled
   URL for `DATABASE_URL` and the direct URL for `DATABASE_URL_UNPOOLED`:

   | Variable | Production | Preview |
   | --- | --- | --- |
   | `DATABASE_URL` | `production` pooled | `preview` pooled |
   | `DATABASE_URL_POOLED` | `production` pooled | `preview` pooled |
   | `DATABASE_URL_UNPOOLED` | `production` direct | `preview` direct |
   | `NEON_BRANCH` | `production` | `preview` |
   | Clerk keys | Development instance | Development instance |

   Keep the Clerk keys identical across Preview and Production while the Clerk
   app is still in development mode. `ensureAppUser` creates users on first
   request, so Preview does not need its own webhook endpoint.

5. **Apply migrations to preview and production** before or during release — never `db push`:

   ```powershell
   $env:DATABASE_URL = npx neonctl connection-string production --project-id <project-id>
   $env:DIRECT_URL = $env:DATABASE_URL
   npm run db:deploy
   ```

6. **Deploy:** Click **Deploy**. Vercel builds Production from `main` and Preview
   from every other branch or pull request.

### Moving Clerk to production later

Clerk production instances require a custom domain you control; a `*.vercel.app`
URL is not enough. When you are ready:

1. Add the domain to Clerk and create the production instance.
2. Point the DNS records Clerk provides at that domain.
3. Replace the Clerk keys in **Vercel -> Production** with the `pk_live_...` / `sk_live_...` values.
4. Keep the development keys in **Vercel -> Preview** and local `.env`.
5. User IDs do not carry over between Clerk instances. If production has real
   data, migrate or re-map users by email before switching.

### Setting up Clerk Webhooks (Production)

1. In the [Clerk Dashboard](https://dashboard.clerk.com/), go to **Webhooks** &rarr; **Add Endpoint**.
2. Set Endpoint URL to `https://your-domain.vercel.app/api/webhooks/clerk`.
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
4. Copy the **Signing Secret** and assign it to `CLERK_WEBHOOK_SIGNING_SECRET` in your Vercel Environment Variables.

---

## 💬 Feedback & Bug Reports

Your feedback is invaluable in shaping GitDone!

- 🐛 **Found a bug?** Open an issue on [GitHub Issues](https://github.com/Dadir-Dev/git-done/issues).
- 💡 **Have a feature request?** Start a discussion or submit an issue with the `enhancement` label.
- 🌐 **Try the Live App:** [git-done-dadirdev.vercel.app](https://git-done-dadirdev.vercel.app/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

