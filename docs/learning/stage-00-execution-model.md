# Stage 0 — The Execution Model

*Completed: 2026-10-22. Depended on: nothing. Unlocks: everything (Stage 1+).*

## Core ideas

1. **Two component worlds.** Server Components (default; run only on the server; can touch `prisma`
   directly; ship no JS) vs Client Components (`"use client"`; live in the browser; cannot reach
   the DB directly).
2. **A Server Action is a public HTTP endpoint.** `"use server"` makes the compiler hash each export
   (`action ID`) and replace the export with a **client reference** (proxy stub). Calls from the
   browser = real `HTTP POST` + `Next-Action` header; the server resolves the ID → runs the real
   function → serializes the result. Args/results must be serializable (that's why
   `ActionResult<T>` is a plain discriminated union, `src/types/index.ts:9-17`).
3. **Same import, two physics.** Calls from Server Components during render (`projects/page.tsx`)
   are plain in-process function calls — no wire. Calls from Client Components
   (`project-dialog.tsx`, `project-workspace.tsx`) are POSTs. Transport is decided by the *caller's*
   side, not the action.
4. **Middleware vs enforcement.** `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) runs
   first on matched requests via `clerkMiddleware`, equipping requests with session context so
   `auth()` works. It bypasses `/api/webhooks/` because those are Svix-signature-authenticated, not
   session-authenticated. `await auth.protect()` in `(dashboard)/layout.tsx` is the *enforcement
   gate* for the dashboard subtree. **Neither protects a Server Action** — each action re-checks
   `auth()` itself.
5. **Security hinge:** action IDs are discoverable; anyone can POST a crafted payload. Client-side
   checks (`maxLength={100}` at `project-dialog.tsx:86`, dialog rendering, disabled buttons) are UX
   only, never security. Next.js gives basic origin checks on action POSTs (CSRF mitigation), but
   that ≠ authorization.

## Key files traced

- `src/proxy.ts` — Next 16 middleware; webhook bypass; matcher skips static assets
- `src/app/(dashboard)/layout.tsx:12` — `await auth.protect()`
- `src/app/(dashboard)/projects/page.tsx` — read path: in-process `getProjects()` during render
- `src/components/projects/project-dialog.tsx:1-45` — write path: `"use client"` + POST proxy
- `src/actions/project.actions.ts:1` — `"use server"` header
- `src/types/index.ts` — `ActionResult<T>` serializable result contract

## Interview answers (final versions)

1. **What is a Server Action?** Async function in a `"use server"` file; compiler assigns hashed ID
   and swaps export for a client reference; browser calls become `POST` with `Next-Action` header;
   server resolves ID → real function → serialized `ActionResult`.
2. **When does 'backend' traffic exist?** Only when the caller is in the browser. Client components →
   POST per call. Server components → in-process calls during render. One GET per page; zero extra
   requests for data fetched while rendering.
3. **Server Actions vs REST?** Single Next.js web client → chose end-to-end type safety
   (`ActionResult` checked both sides), minimal boilerplate, `revalidatePath()` colocated with the
   mutation. Cost: API fused to the framework; if mobile/third-party clients appear, extract REST or
   tRPC points, ideally from a framework-neutral service layer. *Always state the escape hatch.*
4. **`proxy.ts` vs `auth.protect()`?** Identity *availability* (middleware) vs route-subtree
   *enforcement* (layout). Webhooks exempt due to Svix signatures. Actions are individually
   reachable endpoints → each re-checks auth itself.
5. **Trust the caller?** Never. Endpoint is public; verify auth, validate via Zod, and filter
   ownership inside the query, in every action, every time.

## My misconceptions (graded 2026-10-22)

- ❗ Warm-up: I described `createProject`'s server-side *sequence* correctly but didn't answer
  *what happens on the wire* — the call is an HTTP POST via a client reference, not a function call
  to the browser.
- ✅ Q1 refined: browser sends **one GET** for the page; zero additional data requests inside the
  render. Precision of wording matters.
- ✅ Terminology fixes: "referential function" → **client reference**; server does a **registry
  lookup** of `{action ID → function}`; transport = `POST` + `Next-Action` header; args start as
  plain `FormData` strings in the dialog, and `project-workspace.tsx` wraps calls in
  `useTransition` via its `run(...)` helper.

## Open exercises / carry-forward

- [ ] Practice saying interview Q3's trade-off answer out loud, in under 30 seconds.
- [ ] Predict (before Stage 5) why `String(form.get("description") ?? "") || undefined` in
      `project-dialog.tsx:34` produces `""` vs `undefined` and why that interacts weirdly with
      Zod `.trim()` + optional — revisited in Stage 5.
- [ ] Note for Stage 7: Next's built-in origin checks mitigate CSRF but do not mark actions
      authenticated — recheck with docs during that stage.
