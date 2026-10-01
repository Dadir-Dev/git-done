# Product Requirements Document: Project Tracker (MVP)

**Status:** Draft
**Owner:** Dadir Dev
**Last Updated:** August 14, 2026

---

## 1. Overview

Project Tracker is a lightweight web application that lets individuals and small teams organize their work into projects and track tasks within each project. The MVP focuses on the minimum feature set needed to validate the core loop: **create a project → add tasks → track progress to completion.**

The goal of this MVP is to ship a functional, usable product quickly, using off-the-shelf solutions (e.g., managed auth) wherever possible to avoid reinventing solved problems, so engineering effort stays focused on the core project/task experience.

---

## 2. Primary User Persona

**"The Solo Operator" — Individual Contributor / Freelancer / Small Team Lead**

- Manages 3–10 concurrent projects (client work, side projects, or team initiatives)
- Currently uses a mix of tools (Notion, spreadsheets, sticky notes) and finds them either too heavy or too unstructured
- Wants a fast, no-friction way to see "what am I working on" and "what's left to do"
- Not deeply technical from a PM tooling perspective — expects simple, intuitive UX over configurability
- Primarily accesses the tool from a laptop, occasionally checks status from mobile

---

## 3. Core User Stories

### Authentication
- As a user, I want to sign up and log in quickly (email or social login) so I can access my projects securely.
- As a user, I want my session to persist so I don't have to log in every time I return.
- As a user, I want to log out so I can secure my account on shared devices.

### Dashboard
- As a user, I want to see all my projects in one place when I log in, so I know what I'm working on at a glance.
- As a user, I want to see a basic status indicator per project (e.g., task completion %) so I can gauge progress without opening it.

### Project CRUD
- As a user, I want to create a new project with a name and description so I can start organizing work.
- As a user, I want to view a project's details so I can see all associated tasks.
- As a user, I want to edit a project's name/description so I can keep information accurate.
- As a user, I want to delete a project I no longer need so my dashboard stays relevant.

### Task Management
- As a user, I want to add a task to a project so I can break work into actionable items.
- As a user, I want to set a task's status (e.g., To Do / In Progress / Complete) so I can track progress.
- As a user, I want to edit or delete a task so I can keep my task list accurate.
- As a user, I want to see tasks grouped or filtered by status within a project so I can focus on what's active.

---

## 4. In-Scope for MVP

| Area | Included |
|---|---|
| **Auth** | Email/password or social login via a drop-in provider (e.g., Clerk, NextAuth/Auth.js); session persistence; logout |
| **Dashboard** | List/grid view of all user's projects; basic progress indicator per project |
| **Projects** | Create, view, edit, delete (name, description, created date) |
| **Tasks** | Create, view, edit, delete tasks within a project; status field (To Do / In Progress / Complete); manual status toggle |
| **Data Ownership** | Each user only sees their own projects/tasks (single-tenant per user, no sharing) |
| **UI** | Responsive layout (desktop + mobile web) |

---

## 5. Strictly Out-of-Scope for MVP

Explicitly deferred to post-MVP to protect scope:

- ❌ Team collaboration / multi-user projects / shared workspaces
- ❌ Roles & permissions (admin, member, viewer, etc.)
- ❌ Task assignment to other users
- ❌ Comments, activity feed, or @mentions
- ❌ File attachments or uploads
- ❌ Due dates, reminders, or notifications (email/push)
- ❌ Subtasks / task dependencies / nested tasks
- ❌ Drag-and-drop Kanban board view
- ❌ Search and advanced filtering/sorting
- ❌ Tags, labels, or custom fields
- ❌ Third-party integrations (Slack, GitHub, calendar sync, etc.)
- ❌ Analytics/reporting dashboards
- ❌ Native mobile app (iOS/Android)
- ❌ Offline support / PWA capabilities
- ❌ Billing/subscription tiers

---

## 6. Non-Functional Requirements

- **Responsive Design:** Fully usable on desktop and mobile web browsers (breakpoints for at minimum: mobile, tablet, desktop).
- **Performance:** Dashboard and project views should load in under 2 seconds under normal conditions.
- **Security:** All project/task data must be scoped to the authenticated user; no data leakage between accounts. Auth provider handles credential security (no custom password storage).
- **Reliability:** Core CRUD actions (create/update/delete) must persist reliably with clear success/error feedback in the UI.
- **Usability:** No onboarding tutorial required — core actions (create project, add task, change status) should be discoverable within seconds of first login.
- **Browser Support:** Latest two versions of Chrome, Firefox, Safari, and Edge.
- **Accessibility:** Baseline keyboard navigability and sufficient color contrast for status indicators (WCAG AA as a directional target, not a hard MVP gate).

---

## 7. Success Criteria for MVP

The MVP is considered successful if a user can, without external help:
1. Sign up and log in
2. Create a project
3. Add multiple tasks to it
4. Update task statuses
5. See accurate progress reflected on the dashboard
6. Edit or delete a project/task
7. Log out and log back in with all data intact
