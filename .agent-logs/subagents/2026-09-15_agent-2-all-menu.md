# Agent 2 — "All" department menu

- Scope: rework the nav "All" drawer into a flat, keyboard-accessible department menu
- File owned: `components/header/nav-drawer.tsx`

## Log
- 2026-09-15T13:44:30Z — Inspected `components/header/nav-drawer.tsx` (drawer with slide-in sub-menus, close X focused on open, Esc listener, body scroll lock) and grep'd usages: rendered twice in `components/header/header.tsx` (`compact` and desktop). `Department` type in `lib/catalog.ts` matches the local `Dept` type.
- 2026-09-15T13:45:07Z — Rewrote the component:
  - Removed sub-menu state and `animate-slide-in-right` view; departments are now direct links to `/s?dept=<slug>` with their categories as small wrapped secondary links to `/s?dept=<slug>&cat=<catSlug>` (single level).
  - Kept Trending (Best Sellers, New Releases, Today's Deals) and Help & Settings (Your Orders, Your Cart) sections, as data arrays.
  - Trigger: `ref`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (via `useId`). Label updated to "Open all departments menu".
  - Dialog: `role="dialog" aria-modal="true" aria-label="All departments"`; greeting isolated as `<span data-greeting>Hello, sign in</span>`.
  - Focus: first menu link focused on open; `close()` restores focus to the trigger; used by backdrop click, X button, Escape, and every link click.
  - Keyboard: ArrowDown/ArrowUp wrap across all `[data-menu-item]` links, Home/End jump to first/last; Tab/Shift+Tab wrap between first and last focusable in the dialog.
  - Kept body scroll lock, `bg-nav-2` strip, dimmed backdrop, `animate-slide-in-left`/`animate-fade-in`.
- 2026-09-15T13:45:30Z — Changed inner `<nav>` label to "Department menu" to avoid duplicating the dialog's accessible name.
- 2026-09-15T13:45:50Z — `npx eslint components/header/nav-drawer.tsx` → exit 0, no output. `npx tsc --noEmit` → exit 0, no errors (whole project). Nothing failed on first run.
