# Product Requirements Document: GitDone (MVP)

**Status:** Completed MVP (Launch Ready)
**Owner:** Dadir Dev
**Last Updated:** November 28, 2026
**Live Demo:** [git-done-dadirdev.vercel.app](https://git-done-dadirdev.vercel.app/)

---

## 1. Overview

**GitDone** is a calm, dark-themed project and task tracking web application designed for developers, freelancers, and solo operators. It eliminates noise and complex configuration, providing a fast, focused workspace to execute the core productivity loop: **create a project → define actionable tasks → track progress to completion.**

The MVP delivers a complete, production-ready experience featuring server-first data mutations, full-stack type safety, instant feedback, and a focused design system inspired by Linear's clarity and Notion's personal workspace feel.

---

## 2. Primary User Persona

**"The Solo Operator" — Developer / Freelancer / Technical Creator**

- Manages 3–10 concurrent side projects, client projects, or personal initiatives.
- Finds enterprise project management tools (Jira, Asana, Monday) bloated and slow.
- Needs an instant, clear view of "what am I working on" and "what's the next step to finish."
- Values modern dark aesthetics, keyboard accessibility, speed, and zero friction.
- Primarily accesses the workspace from desktop/laptop, with occasional mobile checks.

---

## 3. Core User Stories & Delivered Capabilities

### Marketing & Onboarding
- **Landing Page:** As a visitor, I want to understand GitDone's value proposition and preview the interface before signing up.
- **Fast Sign-up / Sign-in:** As a user, I want to authenticate seamlessly via email or social providers with persistent sessions and dark-themed auth dialogs.

### Dashboard & Analytics Overview
- **Workspace Overview:** As a user, I want to see a high-level summary of all my projects, total tasks, completed tasks, and overall workspace completion rate.
- **Recent Projects:** As a user, I want direct access to recently created/updated projects from the dashboard.

### Project Management (CRUD)
- **Create Project:** As a user, I want to create a new project with a name, optional description, and optional due date via a modal dialog.
- **Project List:** As a user, I want a dedicated projects view with real-time progress bars, completion counts, due dates, and direct links to workspaces.
- **Edit Project:** As a user, I want to update project details (including its due date) without leaving the workspace.
- **Delete Project:** As a user, I want to safely delete a project with confirmation, cascading deletion cleanly to all its tasks.

### Focused Task Board
- **Add Tasks:** As a user, I want to add actionable tasks (with a title, optional description, optional due date, and priority) directly in the project workspace.
- **Due Dates & Priority:** As a user, I want to record when a task is due and how important it is so that I can decide which task to do first.
- **Status Sections:** As a user, I want tasks automatically grouped under clear status headers: **To Do**, **In Progress**, and **Complete**.
- **Status Toggling & Inline Controls:** As a user, I want to change task status via dropdown or mark complete with instant UI updates.
- **Filter Tabs:** As a user, I want to filter tasks by status (**All**, **To do**, **In progress**, **Complete**) for quick focus.
- **Delete Tasks:** As a user, I want to remove individual tasks with immediate cache revalidation.

---

## 4. MVP Implementation Scope

| Area | Delivered in MVP |
|---|---|
| **Marketing** | Dedicated landing page (`/`) with hero, feature highlights, and interactive preview card |
| **Auth** | Clerk authentication (`/sign-in`, `/sign-up`), `auth.protect()` server-side layout guards, customized dark UI components |
| **User Sync** | Dual-layer sync: Svix-verified webhook (`/api/webhooks/clerk`) + JIT fallback (`ensureAppUser`) |
| **Dashboard** | Workspace summary cards (Projects count, Tasks completed ratio, Overall progress %) + Recent projects list |
| **Projects** | Full CRUD with Zod validation, responsive list view, progress indicators, optional due dates, and modal dialogs |
| **Tasks** | Full CRUD, grouped status sections (To Do / In Progress / Complete), instant status change, optional due dates, a `LOW`/`MEDIUM`/`HIGH` priority, and client-side status filter tabs |
| **Data Isolation** | Strict user ownership enforced at both query and database schema level |
| **Design & UI** | Tailored dark UI system with Emerald brand accents (`#34D399`), responsive sidebar/sheet navigation, and accessibility features |
| **Quality** | Vitest unit and integration suites, plus a GitHub Actions CI workflow (typecheck, lint, test) on every pull request |

---

## 5. Post-MVP Roadmap (Future Scope)

The following capabilities are intentionally deferred for future releases based on user feedback:

- ⏳ **Drag-and-Drop Task Board:** Interactive Kanban column dragging.
- ⏳ **Milestones & Overdue Highlights:** Due dates shipped; the milestone layer and overdue styling on top of them did not.
- ⏳ **Tags & Labels:** Categorization by topic or tech stack. (Priority shipped; free-form labels did not.)
- ⏳ **Search & Sort:** Quick search across all projects and tasks.
- ⏳ **Team / Shared Workspaces:** Collaboration, role permissions, and shared projects.
- ⏳ **Activity Log & History:** Audit trail of completed tasks and project changes.
- ⏳ **Keyboard Shortcuts:** Global hotkeys (e.g. `Cmd+K`, `N` for new project).
- ⏳ **Export / Import:** Markdown/JSON export of workspace data.

---

## 6. Non-Functional Requirements & Performance

- **Responsive Design:** Fluid layout across desktop (persistent 250px sidebar), tablet, and mobile (overlay navigation sheet).
- **Performance:** Server-side rendered pages with instant Server Action mutations and Next.js path revalidation.
- **Security & Multi-Tenancy:** Hard data isolation via Clerk `userId` foreign keys on all PostgreSQL queries.
- **Reliability:** Prisma Pg adapter pooling over Neon Serverless Postgres with graceful error handling.
- **Data Integrity:** Calendar dates are validated as real `YYYY-MM-DD` days before storage; enums constrain status and priority.
- **Testability:** Vitest unit and integration suites run locally and in CI on every pull request.
- **Accessibility:** Semantic HTML, ARIA dialog roles, keyboard focus rings (`--brand-focus`), and `prefers-reduced-motion` support.

---

## 7. Success Criteria Verification

All MVP success criteria have been met and verified:
1. ✅ User sign-up and sign-in with persistent sessions.
2. ✅ Project creation, editing, and deletion with zero data leakage.
3. ✅ Task addition, status transitions, and deletion with instant revalidation.
4. ✅ Optional due dates on projects and tasks, validated as real calendar days and round-tripped as `YYYY-MM-DD`.
5. ✅ Task priority (`LOW` / `MEDIUM` / `HIGH`) with a `MEDIUM` default.
6. ✅ Accurate progress calculations displayed on the dashboard and project cards.
7. ✅ Unit and integration tests pass locally and in CI.
8. ✅ Production deployment verified on Vercel with Neon PostgreSQL.

