# Task and Project DueDate

## The Requirement Sentences
1. A user needs to know when each task is due so that they can decide which task to do first.
2. A user needs to see when each project is due so that they can choose which project to finish first.

## Dependencies
- Project due date needs to aggregate task due dates, and there is no task due date to aggregate yet. Task deadline is the leaf both features read from, so it ships first.

## Decision
- dueDate crosses the wire as a date-only ISO string, YYYY-MM-DD. Not epoch milliseconds, not a full ISO timestamp. 
  Reason: the column is @db.Date, which is date-only. The wire format should match the database format to avoid confusion and conversion errors.

## Acceptance Criteria
1. A task created with no dueDate is accepted; the API returns dueDate: null and the row stores NULL.
2. A task created with dueDate: "2026-11-20" returns exactly "2026-11-20" on read. (Tests the read path — not "shows on its taskboard.")
3. "2026-02-30" returns 400 — the date must be rejected, not rolled forward to 2026-03-02.
4. A past date is accepted, stored, and returned unchanged.