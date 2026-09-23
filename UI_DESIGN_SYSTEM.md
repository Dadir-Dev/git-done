# GitDone UI Design System

## Direction

GitDone is a calm, dark workspace for moving meaningful work to done. It takes cues from Linear's density, clarity, and restrained emerald emphasis, with a warmer Notion-like sense of a personal workspace. The interface is deliberate rather than decorative: content leads, controls recede, and borders provide structure.

Do not imitate Linear layouts or introduce visual controls for unsupported product concepts. The MVP surfaces only projects and tasks.

## Foundations

### Color

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#121214` | Application and page background |
| Sidebar | `#0D0D0F` | Persistent navigation |
| Surface | `#19191C` | Dialogs, menus, raised sections |
| Surface raised | `#222226` | Hovered rows and selected controls |
| Border | `rgba(255,255,255,.10)` | Default separators and outlines |
| Border subtle | `rgba(255,255,255,.07)` | Low-emphasis separators |
| Text primary | `#F4F4F5` | Headings and primary labels |
| Text secondary | `#A1A1AA` | Supporting copy |
| Text muted | `#71717A` | Metadata and placeholders |
| Brand | `#34D399` | Primary actions and selected state |
| Brand hover | `#6EE7B7` | Primary-action hover |
| Brand text | `#A7F3D0` | Brand text on dark surfaces |
| Danger | `#F87171` | Destructive actions |
| Success | `#34D399` | Completed tasks only |
| Active | `#60A5FA` | In-progress tasks only |

Semantic color must always be paired with an icon or text label. Accent is reserved for a clear action or current selection, never large decorative areas.

### Typography

Use Geist Sans via `next/font` as the interface typeface. Default UI text is `text-sm` / 14px with a 20px line height; metadata is `text-xs` / 12px. Page titles are 24–30px, compact with tight tracking. Use medium (500) for labels, semibold (600) for hierarchy, and normal weight for descriptions. Brand colors are defined once as CSS variables in `src/app/globals.css` and exposed as `bg-brand`, `bg-brand-hover`, `text-brand-text`, and related Tailwind utilities.

### Space, shape, and elevation

Use a 4px base grid: 4, 8, 12, 16, 20, 24, 32, and 40px. Default controls are 36px high; primary controls may be 40px. Use 6px radius for compact controls, 8px for inputs and rows, and 12px for dialogs. Separation comes from 1px borders (`border-white/10`); shadows are limited to dialogs and mobile navigation overlays.

## Layout and responsiveness

Desktop uses a persistent 248px sidebar and a flexible content region. The content header remains compact and uses a subtle bottom border. Page content has 24px padding at desktop, 16px at tablet, and 12–16px on mobile.

At widths under 1024px the sidebar is hidden behind a menu button and opens as a modal sheet. Tables transform into stacked project rows; secondary metadata is hidden before primary project and progress information. Dialogs use a 480px maximum width on desktop and sit within 16px viewport gutters on mobile.

## Navigation

The sidebar contains the GitDone mark, a compact workspace label, Dashboard and Projects navigation, and the Clerk user menu. A selected item uses a slightly raised neutral surface and a 2px emerald leading indicator. Navigation should never use broad cards or gradients.

## Screen patterns

### Dashboard and projects

Use a list-first workspace view. The header shows a title, concise explanatory copy, count, and a `New project` action. Each project row shows its name, optional description, task-progress fraction, progress bar, and a directional affordance. Empty states use one short explanation and a single clear next action.

### Project workspace and tasks

The project header contains a back link, editable title/description through a contained dialog, task count, and overflow-style actions. Tasks are shown under compact status sections: To do, In progress, and Complete. A client-side filter lets users focus without changing their stored data. Each task has a status selector; completion uses a check icon and subdued title treatment.

### Forms, dialogs, and menus

Forms use visible labels, calm placeholders, 8px fields, and inline validation feedback. Dialogs dim the canvas, have a clear title and description, trap neither unsupported focus behavior nor functionality, and support Escape/outside dismissal when safe. Destructive confirmation is visually distinct and uses explicit copy.

## States and interaction

Every interactive control has 150ms ease-out color/background transitions, visible keyboard focus (`2px` brand ring), and disabled opacity with no pointer interaction. Rows gain a subtle raised surface on hover. Use small progress indicators and disabled submit controls during pending mutations. Empty, error, and loading states must keep their layout stable and offer a direct recovery action where possible. Honor `prefers-reduced-motion` by removing non-essential motion.

## Accessibility

Maintain AA-leaning text contrast; never identify task status by color alone. Use semantic buttons, labels linked to inputs, descriptive dialog headings, keyboard-reachable navigation, and `aria-expanded` for collapsible navigation. Icon-only buttons require an `aria-label`. Keep target sizes at least 36px for standard controls and 40px for touch-critical actions.

## Tailwind and Shadcn conventions

Use Tailwind v4 utilities against the token variables defined in `globals.css`; avoid one-off hex values in components. Reusable primitives live in `src/components/ui` and use `cn()` when variants need composition. Follow Shadcn's compositional model (button, input, dialog, select primitives) and Radix-quality accessibility when those primitives are introduced. Keep pages server-rendered; place only stateful controls and server-action callers in narrow client components.
