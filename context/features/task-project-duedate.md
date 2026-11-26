# Task and Project DueDate

|              |                                      |
| ------------ | ------------------------------------ |
| Status       | inc. 1 shipped · inc. 2 shipped      |
| Created      | 2026-11-12                           |
| Last amended | 2026-11-26                           |
| Shipped      | inc. 1 — `f9d4af0` (merge `5a873ef`) · inc. 2 — `9295599` (merge `f06185f`) |

## The Requirement Sentences
### Task due date
1. A user needs to know when each task is due so that they can decide which task to do first.

### Project due date
1. A user needs to see a deadline on the project because a project is what finishes — the deadline decides which project is done first, and a task list cannot answer that question.

## Dependencies
- Ordering only: the task deadline is the leaf and ships first; the project deadline reuses the same wire type. Neither date is derived from the other.

## Decision
- dueDate crosses the wire as a date-only ISO string, YYYY-MM-DD. Not epoch milliseconds, not a full ISO timestamp.
  Reason: the column is @db.Date, which is date-only. The wire format should match the database format to avoid confusion and conversion errors.

## Acceptance Criteria
### Task — T1–T4 · shipped `f9d4af0`
- T1. A task created with no dueDate is accepted; the action returns dueDate: null and the row stores NULL.
- T2. A task created with dueDate: "2026-11-20" returns exactly "2026-11-20" on read. (Tests the read path — not "shows on its taskboard.")
- T3. "2026-02-30" is rejected by the Zod schema — the date must be rejected, not rolled forward to 2026-03-02.
- T4. A past date is accepted, stored, and returned unchanged.

### Project — P1–P3 · shipped `9295599`
- P1. A project created with no dueDate is accepted; the row stores NULL and reads back null.
- P2. A project created with dueDate: "2026-11-30" reads back "2026-11-30" in SQL and prints `Due 2026-11-30` on the card.
- P3. An edit that omits dueDate leaves the stored value unchanged. (Canary.)

## Out of scope
- Precedence/overdue · authz test · sorting · aggregation

## History
| Date       | Change                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-23 | Project section added; dependencies restated as ordering; task criteria restated in action terms ("400" = Zod parse fails) |
| 2026-11-26 | inc. 2 shipped: nullable `projects.dueDate` (`@db.Date`), one shared `dateOnlyWireSchema` (`""` → `null`, omitted stays absent), the `undefined` guard in `updateProject`, and the UI surfaces. Five integration tests in `tests/integration/project-due-date.test.ts`; suite 22/22. |