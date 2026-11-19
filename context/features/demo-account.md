# Demo Account

> Status: proposed, not scheduled. Written 2026-11-17, out of Day 5. Ships after increment 1's write path, before the job sprint.

## The Requirement Sentences

1. A recruiter needs to land in a populated workspace within one click so that the first thing they see is the product working, not an empty onboarding state.
2. A visitor must not be able to reach or alter any account that is not the demo account.

## Context — what is true today (verified 2026-11-17)

| Fact | Where |
|---|---|
| 2 Clerk users, 5 projects, 17 tasks, 1 task with a `dueDate` | Neon `users`, `projects`, `tasks` |
| Both existing users authenticate through Google OAuth | Clerk `imageUrl` is an `oauth_google` asset |
| Seed data has fixed ids (`seed-project-*`, `seed-task-*`) and is driven by `SEED_USER_ID` / `SEED_USER_EMAIL` / `SEED_USER_NAME` | `prisma/seed.ts` |
| Every read and mutation scopes by `userId`; another user's project returns `NOT_FOUND` | `src/actions/*.actions.ts` |
| Only `(dashboard)/layout.tsx` calls `auth.protect()`; no global route protection | `src/app/(dashboard)/layout.tsx`, `src/proxy.ts` |
| The sidebar displays `fullName ?? username ?? primaryEmailAddress ?? "Account"` | `src/app/(dashboard)/layout.tsx:17` |
| Live demo is `git-done-dadirdev.vercel.app`; `gitdone.app` is not owned | README, DNS |

**Consequence.** A visitor who signs up gets their own Clerk user and therefore **an empty workspace** — every project is invisible by design. The demo today is an auth screen followed by an empty state. Nothing is broken; the product simply has no shared-data path, because sharing data is exactly what the authorization model prevents.

**Consequence for this feature.** The demo cannot be "a login URL for existing data" without choosing one of the options below. This is an authz design decision, not an email rename.

## Dependencies

- **Increment 1's write path (Day 6+).** A demo exists to be used. Until `createTask` stops spreading `...parsed.data`, a visitor entering a date gets a `PrismaClientValidationError`. Demo launch waits for that.
- **Increment 3 (AI feature), if it ships first.** All demo visitors share one `userId`, so a per-user rate limit protects nothing. Decide a per-IP or per-session cap, or disable the AI feature for the demo user, *before* exposing it publicly.
- Nothing else. No schema change is required by the recommended design.

## Options considered

| # | Design | Cost | Why not (or why) |
|---|---|---|---|
| A | Shared demo user + published email/password | Low | A credential in a public page is a standing invitation. The first visitor who changes the password or email locks everyone out; via Clerk's profile UI they could take the account. |
| B | **Shared demo user + server-minted sign-in ticket** | Medium | **Chosen.** One click, no credential to leak, revocable by deleting one Clerk user. Single-use, expiring token. |
| C | Fork the seed data into each visitor's own account on first sign-in | Medium-high | Safest (no shared writes) but needs a copy routine, a "has been forked" marker, and it still requires a sign-up step. Good v2, not v1. |
| D | Anonymous read-only demo with no session | High | Requires bypassing `auth.protect()` and `userId` scoping in every action — it deletes the exact property the portfolio is meant to demonstrate. |

## Decision

1. **One dedicated Clerk user** referenced by `DEMO_CLERK_USER_ID`. It has no password and no OAuth identity, so it cannot be signed into by any route except ours. Its email is a mailbox the owner controls but never uses to sign in and never publishes — an unowned domain cannot be verified and cannot receive a reset.
2. **A "Try the demo" button** on `/` and the sign-in page calls `POST /api/demo/session`. That route mints a Clerk **sign-in token** for `DEMO_CLERK_USER_ID` using the server-only secret; the client exchanges it with `signIn.create({ strategy: "ticket", ticket })`. Verify the exact API against the installed SDK (`@clerk/nextjs` 7.9) before writing it — do not port a v5 example.
3. **The route accepts no identity input.** The user id comes from the environment, never from the request. That is the security property of this feature; everything else is convenience.
4. **Reset on mint, not on a cron.** If the demo dataset is older than 6 hours, the same route deletes and reseeds it before minting. No scheduler to babysit, no deploy hook, and a bounded collision window if two visitors arrive together. Data comes from a function extracted out of `prisma/seed.ts` into `src/lib/seed-demo.ts`, so the CLI seed and the route cannot drift.
5. **Writes stay enabled in v1.** A read-only demo shows screenshots with extra steps. The 6-hour reset bounds the damage, and the banner below tells the visitor why their task disappeared.
6. **A one-line banner** above the board for the demo user: *"Demo data. Changes reset periodically."* Honesty beats a visitor assuming the app loses data.

## Guardrails

- **Rate limit minting:** 5 per hour per IP → `429`. This endpoint creates sessions; unthrottled, it is a session factory.
- **Token lifetime:** shortest workable TTL, single use, never logged, never put in a URL (it would land in referrers and logs).
- **Secret containment:** `CLERK_SECRET_KEY` used only in server code; a build-time check that it is absent from the client bundle.
- **Reset blast radius:** `deleteMany({ where: { userId: DEMO_CLERK_USER_ID } })` and nothing else. Any other `where` is a data-loss bug.
- **Email never rendered:** the display-name chain ends at `"Account"`; `primaryEmailAddress` is removed from it.
- **Concurrency:** reset is guarded by a `last_reset_at` comparison, so simultaneous mints do not reseed twice; a visitor mid-session may still see a reset land. Accepted in v1.

## Acceptance Criteria

1. With no session, one click on "Try the demo" lands on `/projects` showing 3 projects and 17 tasks, with no credential typed and no sign-up form.
2. The same ticket twice fails; each click mints a new session.
3. `POST /api/demo/session` with `{ "userId": "<any other id>" }` in the body or query mints a session for the demo user only — never for the supplied id. This is the auth-bypass test.
4. The 6th mint within an hour from one IP returns `429`.
5. After a reset: exactly 3 projects, 17 tasks, and the `2026-11-20` fixture present; the non-demo accounts' row counts are unchanged (asserted in the same test).
6. A demo session requesting the owner's project id gets `NOT_FOUND` — authorization still holds inside the demo, and this is the behaviour worth showing a recruiter.
7. A client bundle built for production contains no `CLERK_SECRET_KEY`.
8. A user with no `fullName` and no `username` sees "Account" in the sidebar, never an email address.
9. A visitor cannot change the demo account's email or password: the account has no password, and profile management is not reachable from the demo UI.

## Open Questions

- **6-hour reset vs nightly Vercel Cron.** Cron (Hobby: once per day) is simpler to reason about and worse for the first visitor after a busy day. Reset-on-mint is chosen; revisit if a reset ever lands under an active visitor twice.
- **Read-only mode for the AI increment.** A shared user id means per-user limits are meaningless. Per-IP cap, or read-only AI in the demo?
- **Which mailbox.** Recommended: a dedicated Gmail (e.g. `gitdone.demo@gmail.com`) — real, verifiable, never published. Rejected: anything `@gitdone.app`, since the domain is not owned and the address is unverifiable.
- **Where the button lives** — the landing page, the sign-in page, or both. Both is probably right; the landing page needs a promise the app can keep.

## Non-Goals

- Per-visitor data forks (option C), multi-tenant isolation, or any schema change.
- Anonymous read-only access (option D).
- Buying a domain or moving off `*.vercel.app`. That is packaging, and it is a separate note.
- Renaming the owner's personal account. It stays private and is not the demo — the demo gets its own user precisely so a reset can never touch real work.

## Runbook (for when it lands)

- **Rotate the demo:** create a Clerk user → set `DEMO_CLERK_USER_ID` → deploy → delete the old user (this kills every live demo session).
- **Kill all demo sessions now:** delete the demo Clerk user. Sessions die with it; recreate and redeploy to restore.
- **Reset by hand:** run the demo seed for `DEMO_CLERK_USER_ID` — the same function the route calls.

## Rough size

Half a day plus tests: one route, one client button, one extracted seed function, one env var, one banner. The authz test (#3) and the reset test (#5) are the two that must exist; the rest are polish.
