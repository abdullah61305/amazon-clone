# amazon-clone

A rebuild of the Amazon.com shopping journey — **homepage → search → results & filters → product page → cart → checkout → confirmation** — made by studying the live product and re-engineering its highest-value flows.

**Live:** https://amazon-clone-eight-tawny.vercel.app

## What's in it

| Surface | Behaviour |
|---|---|
| Header | Sticky two-belt nav, department-scoped search, "All" drawer with sub-menus, Account & Lists flyout, live cart count |
| Search | Typeahead suggestions with match highlighting (keyboard accessible), typo correction ("iphnoe" → "iphone") with "Search instead for" the original, stemming |
| Results | URL-driven filters (department, rating, brand, price, deals — combined with AND), sort, pagination, removable filter chips with instant feedback, mobile filter sheet, **Help me decide** (lowest price / best rated / best value from the current results) |
| Product page | Hover-swap gallery + full-view lightbox, swipe gallery on phones, variations that change price, buy box with delivery cut-off, reviews histogram, related shelf, sticky mobile add-to-cart |
| Cart | Instant quantity stepper, delete / save for later with **Undo**, saved-for-later list, free-delivery progress |
| Checkout | Amazon-style 3-step checkout with validation, delivery speeds, tax and totals, confirmation and Your Orders — **simulated, no payment details collected** |

## Deliberate improvements over amazon.com

- **No-results page helps you recover** (spelling suggestion, clear filters, departments, popular items) instead of showing unrelated sponsored products.
- **Add to cart is non-blocking** — a confirmation panel with subtotal and checkout, instead of a full-screen protection-plan upsell.
- **Undo** after deleting or saving for later, instead of a dead "was removed" line.
- **Active filter chips** and shareable, back-button-friendly filter URLs.
- **Skeletons and image placeholders** instead of blank cards while content loads.
- **Help me decide** picks one product per goal from the current results and says why in one sentence.
- **Motion with purpose**: one easing curve, cart icon bump, instant filter/checkbox feedback while results load, visible Undo countdown — every animation under 250ms.
- **Phones get a phone layout** (search row, filter sheet, swipe gallery, sticky CTA), not a shrunken desktop page.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · lucide-react · Vercel.

No backend: the catalog is a curated, enriched snapshot of [DummyJSON](https://dummyjson.com) (`scripts/build-catalog.mjs` → `data/catalog.json`), product pages are statically generated, and cart / saved items / orders persist in `localStorage` (synced across tabs).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
node scripts/build-catalog.mjs   # refresh the catalog snapshot
```

## Notes

Design and engineering study only — not affiliated with Amazon. No Amazon imagery is used; product data and images come from DummyJSON. `.agent-logs/` and `CAPTURE-TEST.md` are part of the assignment submission.
