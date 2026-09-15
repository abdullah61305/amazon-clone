# Coordinator — merge of the five-agent fast-fixes pass

Scope: dispatch five scoped agents in parallel, integrate their work, run whole-diff checks, deploy and verify.

## Dispatch plan

| Agent | Scope | Files owned |
|---|---|---|
| 1 | Footer redesign (visual only) | `components/footer.tsx`, `components/back-to-top.tsx` |
| 2 | "All" department menu | `components/header/nav-drawer.tsx` |
| 3 | Changeable delivery ZIP | `lib/location.ts` (new), `components/header/deliver-to.tsx` (new), `components/header/header.tsx` (Deliver-to only), `components/product/purchase.tsx` (Deliver-to + date offset only) |
| 4 | Sign-in | `lib/account.ts` (new), `components/header/sign-in-dialog.tsx` (new), `components/header/account-menu.tsx` |
| 5 | Stripe-style card form | `lib/card.ts` (new), `components/checkout/card-form.tsx` (new), `components/checkout/checkout-flow.tsx` (payment step only) |

- The brief asked for Agents 3 and 4 to run one after the other because both touch the header. Instead, file ownership was split so they could safely run in parallel. Agent 3 owns `header.tsx`. Agent 4 only edits `account-menu.tsx`.
- Both keep their state in `useSyncExternalStore` hooks over localStorage, with no React provider, so neither needed to edit the root layout.
- Cross-cutting wiring (the drawer greeting, and showing the ZIP and account in checkout) was held back for this merge.
- Agents were told not to build, not to run a dev server and not to run git commands (limited memory), and to put their progress notes in this folder. The folder is kept separate from the hook-generated capture files in `.agent-logs/`.

## Timeline (2026-09-15, local time; order as observed)

- Agent 1 (footer) reported done. It rewrote the footer into four tiers: back to top, a four-column link grid, a logo row with static language/region pills, and a bottom bar with the not-affiliated line. eslint and tsc passed.
- Agent 2 (All menu) reported done. It made a flat department list with category links, arrow/Home/End keys, a Tab focus trap and focus return. eslint and tsc passed.
- Agent 3 (ZIP) reported done. It added `useDeliveryZip()`, a "Choose your location" dialog in a portal, a phone strip, a ZIP label in the buy box and a 0/1-day date offset. eslint and tsc passed.
- Agent 4 (sign-in) reported done. It added `useAccount()` with `signIn`/`signOut`, a sign-in/create-account dialog with inline validation, and "Hello, <name>" plus Sign Out in the account menu. The password is never stored. eslint and tsc passed.
- Agent 5 (payment) reported done. It added the card helpers (brand detection, formatting, Luhn and expiry checks) and a Stripe-style card box with inline errors and a test-card fill. Only brand and last 4 digits leave the form. eslint and tsc passed, and the helper self-check matched expectations.

## Merge changes (this coordinator)

- `components/header/nav-drawer.tsx`: the greeting now reads `useAccount()` and shows "Hello, <name>". Added a missing space between two JSX attributes (`aria-label="Department menu"className=`); it still compiled, but read as a typo.
- `components/checkout/checkout-flow.tsx`:
  - The banner copy was out of date. It said "No real payment details are requested", which is no longer true now that card fields exist. It now says card details never leave the page and nothing is charged.
  - "Fill a sample address" now uses the saved delivery ZIP and its city.
  - `CardForm` is prefilled from the address name and ZIP.
  - Delivery dates and the saved order's delivery days include the ZIP offset.
  - The order summary shows "Ordering as <name> (<email>)" when signed in.
- `components/footer.tsx`: renamed two links whose labels promised features the store doesn't have ("Sell Electronics" → "Shop Electronics", "Shop with Points" → "Deals & Savings").

## Problems hit during the merge

- The first run of the merge script failed on the `CardForm` match. `checkout-flow.tsx` had CRLF line endings after Agent 5's edit. The script throws before writing, so nothing was partially applied. The script now strips CR before matching.
- A `sed` attempt to add CR stripping mangled the regex escape, and Node reported a SyntaxError. I replaced the line with `split(String.fromCharCode(13)).join('')` and re-ran.

## Whole-diff verification

- `npx tsc --noEmit`: pass.
- `npx eslint .`: pass.
- `npx next build`: compiled; 167/167 static pages generated.
- Live verification at 1440px and 390px follows the deploy (recorded in the session's capture log).
