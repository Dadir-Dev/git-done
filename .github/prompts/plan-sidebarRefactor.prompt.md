## Plan: Scalable Sidebar Refactor

Refactor the monolithic sidebar into reusable navigation, account, desktop, and mobile components. Add Lucide icons, preserve the existing styling, and correct the route model so `/projects` owns the project list while `/dashboard` becomes a distinct overview.

**Steps**

1. Add `lucide-react` and create typed navigation configuration:
   - Dashboard: exact `/dashboard` matching.
   - Projects: `/projects` and descendant matching.
   - Store labels, icons, routes, and active-match behavior outside JSX.

2. Create reusable components under `src/components/navigation/`:
   - `sidebar-brand.tsx`
   - `navigation-links.tsx`
   - `active-nav-link.tsx`
   - `sidebar-account.tsx`
   - `sidebar-content.tsx`
   - `desktop-sidebar.tsx`
   - `mobile-navigation.tsx`
   - `mobile-menu-toggle.tsx`

3. Keep client boundaries narrow:
   - `ActiveNavLink` owns `usePathname`.
   - `MobileNavigation` owns drawer state, Escape handling, backdrop dismissal, and link closing.
   - `DesktopSidebar` remains server-renderable.
   - Replace text glyphs with Lucide icons and preserve accessible labels and focus states.

4. Update [layout.tsx](<src/app/(dashboard)/layout.tsx>):
   - Authenticate with Clerk once.
   - Derive the account label using full name, username, primary email, then a fallback.
   - Pass only the display name to the sidebar components.

5. Correct routing:
   - Move the existing project-list page to [projects/page.tsx](<src/app/(dashboard)/projects/page.tsx>).
   - Rename `DashboardWorkspace` to `ProjectsListWorkspace` if appropriate.
   - Make [dashboard/page.tsx](<src/app/(dashboard)/dashboard/page.tsx>) a separate overview using existing project/task data.
   - Preserve the existing project detail route and server actions.

6. Verify:
   - Run `npm run lint`.
   - Run `npm run build`.
   - Test desktop/mobile rendering around the `lg` breakpoint.
   - Test active links for `/dashboard`, `/projects`, and `/projects/[projectId]`.
   - Test mobile open, close, backdrop click, Escape, link navigation, and keyboard focus.
   - Test account-name fallbacks.

**Relevant files**

- [app-sidebar.tsx](src/components/app-sidebar.tsx)
- [layout.tsx](<src/app/(dashboard)/layout.tsx>)
- [dashboard/page.tsx](<src/app/(dashboard)/dashboard/page.tsx>)
- [dashboard-workspace.tsx](src/components/dashboard-workspace.tsx)
- [project-workspace.tsx](src/components/project-workspace.tsx)
- [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md)
- [package.json](package.json)

The plan is saved in `/memories/session/plan.md`. No implementation files have been changed yet.
