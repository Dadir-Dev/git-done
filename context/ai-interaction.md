# AI Interaction Guidelines

## Context Documents

Read these before changing anything:

- `context/project-overview.md` — product vision, scope, architecture, and data model.
- `context/coding-standards.md` — the engineering conventions this project follows.
- `context/current-feature.md` — the feature in flight and the change history.

The product and architecture canon lives in `docs/git-done-prd.md` (requirements), `docs/ARCHITECTURE.md` (implementation), and `UI_DESIGN_SYSTEM.md` (visual language). If a change alters a documented decision, update the affected documents in the same change.

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create new branch for feature, fix, etc
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Verify** - Verify it works in the browser. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`
5. **Iterate** - Iterate and change things if needed
6. **Commit** - Only after build passes and everything works
7. **Merge** - Merge to main
8. **Delete Branch** - Delete branch after merge
9. **Review** - Review AI-generated code periodically and on demand.
10. Mark as completed in @context/current-feature.md and add to history

Do NOT commit without permission and until the build and checks pass. If the build or checks fail, fix the issues first.

> There is no test script in this project yet. Vitest is the intended runner once it is configured; until then the gate is lint, type-check, production build, and manual browser verification.

## Branching

We will create a new branch for every feature/fix. Name branch **feature/[feature]** or **fix/[fix]**, etc. Ask to delete the branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Claude" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)
