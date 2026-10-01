# GitDone UI Design System

## Direction

GitDone is a calm, dark workspace for moving meaningful work to done. It takes cues from Linear's density, clarity, and restrained emerald emphasis, with a warmer Notion-like sense of a personal workspace. The interface is deliberate rather than decorative: content leads, controls recede, and subtle borders provide structure.

The design philosophy avoids visual noise and excessive animation, keeping the developer or creator immersed in their workflow without distraction.

---

## Foundations

### Color Tokens

| Token | CSS Variable / Hex | Tailwind Utility | Use |
| --- | --- | --- | --- |
| Canvas | `#121214` | `bg-[#121214]` / `bg-background` | Application background & page canvas |
| Sidebar | `#0D0D0F` / `#161618` | `bg-[#161618]` | Persistent navigation sidebar & modal sheets |
| Surface | `#19191C` | `bg-[#19191C]` | Dialogs, elevated panels, dropdowns |
| Surface Raised | `#222226` / `#202024` | `bg-[#202024]` | Form inputs, selects, elevated rows |
| Border | `rgba(255, 255, 255, 0.10)` | `border-white/10` | Default card borders, separators |
| Border Subtle | `rgba(255, 255, 255, 0.07)` | `border-white/[0.07]` | Row dividers and subtle outlines |
| Text Primary | `#F4F4F5` | `text-zinc-100` / `text-foreground` | Headings, titles, primary labels |
| Text Secondary | `#A1A1AA` | `text-zinc-400` | Subheadings, descriptions, helper text |
| Text Muted | `#71717A` | `text-zinc-500` / `text-zinc-600` | Metadata, counts, placeholders |
| Brand | `#34D399` | `bg-brand` / `text-brand` | Primary CTA buttons, progress bars, active highlights |
| Brand Hover | `#6EE7B7` | `hover:bg-brand-hover` | Interactive hover state on brand actions |
| Brand Soft | `rgb(52 211 153 / 0.10)` | `bg-brand-soft` / `bg-brand-text/6` | Badges, pills, subtle highlights |
| Brand Text | `#A7F3D0` | `text-brand-text` | Brand labels, links, and high-contrast badges |
| Status: To Do | `#71717A` / `bg-zinc-500` | `text-zinc-400` | Pending/To Do task indicators |
| Status: In Progress | `#60A5FA` / `bg-blue-400` | `text-blue-300` | Active/In Progress task badges |
| Status: Complete | `#34D399` / `bg-emerald-400` | `text-emerald-400` | Completed task checkboxes & checkmarks |
| Danger | `#F87171` / `text-red-400` | `text-red-400`, `bg-red-400` | Destructive actions and delete confirmations |

> [!NOTE]
> Semantic color must always be paired with an icon or clear text label. Accent colors are reserved for actionable targets and current selections, never large decorative backgrounds.

---

### Typography

- **Primary Typeface:** `Geist Sans` loaded via Next.js Google Fonts (`next/font/google`).
- **Monospace Typeface:** `Geist Mono` for code and identifier tokens.
- **Scale & Hierarchy:**
  - Page Titles: `text-3xl` (30px) / `tracking-tight` / font-semibold (`#F4F4F5`).
  - Section / Card Headers: `text-sm` (14px) / font-medium (`#E4E4E7`).
  - Body Text: `text-sm` (14px) / `leading-6` (`#A1A1AA`).
  - Metadata / Badges / Labels: `text-xs` (12px) / `tracking-[0.14em]` uppercase (`#A7F3D0` or `#71717A`).

---

### Space, Radius, and Elevation

- **Grid Base:** 4px spacing unit (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Corner Radii:**
  - Compact Badges & Filters: `rounded` (4px) / `rounded-md` (6px)
  - Inputs & Action Buttons: `rounded-lg` (8px)
  - Cards, Containers & Dialogs: `rounded-xl` (12px)
- **Borders over Shadows:** Depth is established using `1px` translucent borders (`border-white/10` and `border-white/[0.07]`). Elevated shadows are reserved for modal dialogs (`shadow-2xl shadow-black/40`).

---

## Layout & Responsive Structure

- **Desktop (>= 1024px):**
  - Persistent fixed sidebar (`w-62.5` / 250px) with brand logo, workspace badge, navigation links, and Clerk user button.
  - Main content offset via `lg:pl-62.5` with a responsive max-width container (`max-w-6xl` or `max-w-4xl`).
- **Mobile & Tablet (< 1024px):**
  - Compact sticky top bar with hamburger menu toggle.
  - Slide-out mobile sheet drawer (`MobileNavigation`) with backdrop blur and smooth sliding transition.
  - Action buttons and filter tabs adapt horizontally with touch-friendly tap targets (>= 36px).

---

## Screen & Component Patterns

### 1. Marketing & Landing (`/`)
- Dark canvas with subtle centered radial brand glow (`bg-brand/10 blur-[100px]`).
- Value proposition badge, bold headline, dual CTAs ("Start tracking for free" / "Open your workspace").
- Live-styled preview card demonstrating real project and task states.

### 2. Dashboard (`/dashboard`)
- **Metric Stat Cards:** Quick summary grid displaying Total Projects, Tasks Ratio (`completed/total`), and Overall Progress Percentage.
- **Recent Projects:** Compact list showing recent projects, task counts, and percentage progress bars.

### 3. Projects List (`/projects`)
- Header with project count badge and primary `+ New project` modal trigger.
- Clean stacked list view: project title, description, task completion fraction, visual progress bar, and navigation chevron.
- Thoughtful empty state with direct action when zero projects exist.

### 4. Project Workspace & Task Board (`/projects/[id]`)
- **Header:** Back navigation link, project title, description, and quick-action buttons (`+ Add task`, `Edit`, `Delete`).
- **Filter Tabs:** Segmented pill controls to filter view by `All`, `To do`, `In progress`, and `Complete`.
- **Status Sections:** Automatic grouping of tasks with status indicator dots, strike-through styling on completion, inline status dropdown selector, and delete trigger.
- **Project Dialogs:** Contained modal overlays for adding tasks, editing project metadata, and confirming project deletion.

---

## Interactions & Accessibility

- **Keyboard Focus:** Global focus indicator via `:focus-visible` with `2px solid var(--brand-focus)` and `2px` offset.
- **Pending Mutations:** Asynchronous Server Actions use React 19 `useTransition` to provide immediate pending states (`disabled:opacity-50`) without layout jumps.
- **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce` by zeroing transition durations and animations globally.
- **Screen Reader Support:** Explicit `aria-label`, `aria-modal`, `role="dialog"`, `role="alert"`, and semantic HTML landmarks.

