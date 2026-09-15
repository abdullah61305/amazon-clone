import type { Metadata } from "next";
import Link from "next/link";
import { Star, X } from "lucide-react";
import {
  categoryName,
  departmentName,
  departments,
  didYouMean,
  PAGE_SIZE,
  PRICE_BUCKETS,
  search,
  SearchParams,
  Sort,
  SORTS,
  topRated,
} from "@/lib/catalog";
import { ResultCard } from "@/components/product-card";
import { SortSelect } from "@/components/results/sort-select";
import { FilterSheet } from "@/components/results/filter-sheet";
import { NoResults } from "@/components/results/no-results";

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parse(raw: Raw): SearchParams {
  const sort = first(raw.sort);
  const rating = Number(first(raw.rating));
  const page = Number(first(raw.page));
  return {
    k: first(raw.k)?.slice(0, 120) || undefined,
    dept: departments.some((d) => d.slug === first(raw.dept)) ? first(raw.dept) : undefined,
    cat: first(raw.cat) || undefined,
    brand: first(raw.brand)?.split("|").filter(Boolean),
    rating: rating >= 1 && rating <= 4 ? Math.floor(rating) : undefined,
    price: PRICE_BUCKETS.some((b) => b.value === first(raw.price)) ? first(raw.price) : undefined,
    deals: first(raw.deals) === "1",
    sort: SORTS.some((s) => s.value === sort) ? (sort as Sort) : undefined,
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined,
  };
}

function toQuery(p: SearchParams) {
  const sp = new URLSearchParams();
  if (p.k) sp.set("k", p.k);
  if (p.dept) sp.set("dept", p.dept);
  if (p.cat) sp.set("cat", p.cat);
  if (p.brand?.length) sp.set("brand", p.brand.join("|"));
  if (p.rating) sp.set("rating", String(p.rating));
  if (p.price) sp.set("price", p.price);
  if (p.deals) sp.set("deals", "1");
  if (p.sort && p.sort !== "featured") sp.set("sort", p.sort);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  return `/s?${sp.toString()}`;
}

/** Any filter change resets pagination, like Amazon. */
const withChange = (p: SearchParams, change: Partial<SearchParams>) => toQuery({ ...p, page: undefined, ...change });

export async function generateMetadata({ searchParams }: { searchParams: Promise<Raw> }): Promise<Metadata> {
  const p = parse(await searchParams);
  return { title: p.k ? `Amazon.com : ${p.k}` : p.dept ? departmentName(p.dept) : "Search results" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Raw> }) {
  const params = parse(await searchParams);
  let result = search(params);
  let corrected: string | null = null;
  if (result.total === 0 && params.k) {
    corrected = didYouMean(params.k);
    if (corrected) result = search({ ...params, k: corrected });
  }
  const effective = corrected ? { ...params, k: corrected } : params;
  const { total, page, pageCount, results } = result;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(total, page * PAGE_SIZE);

  const chips: { label: string; href: string }[] = [];
  if (params.dept && (params.k || params.cat)) chips.push({ label: departmentName(params.dept), href: withChange(params, { dept: undefined, cat: undefined }) });
  if (params.cat) chips.push({ label: categoryName(params.cat), href: withChange(params, { cat: undefined }) });
  for (const b of params.brand ?? []) chips.push({ label: b, href: withChange(params, { brand: params.brand!.filter((x) => x !== b) }) });
  if (params.rating) chips.push({ label: `${params.rating}★ & Up`, href: withChange(params, { rating: undefined }) });
  if (params.price) chips.push({ label: PRICE_BUCKETS.find((b) => b.value === params.price)!.label, href: withChange(params, { price: undefined }) });
  if (params.deals) chips.push({ label: "Today's Deals", href: withChange(params, { deals: undefined }) });
  const hasFilters = chips.length > 0;
  const clearAll = toQuery({ k: params.k, dept: params.k ? undefined : params.dept, sort: params.sort });

  const heading = params.k ? (
    <>
      for <span className="font-bold text-[#c45500]">&quot;{corrected ?? params.k}&quot;</span>
    </>
  ) : params.cat ? (
    <>in <b>{categoryName(params.cat)}</b></>
  ) : params.dept ? (
    <>in <b>{departmentName(params.dept)}</b></>
  ) : params.deals ? (
    <>in <b>Today&apos;s Deals</b></>
  ) : null;

  const filters = (
    <FilterPanel params={effective} brands={result.brands} categories={result.categories} />
  );

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Result info bar */}
      <div className="border-b border-line shadow-[0_1px_2px_rgba(0,0,0,.08)]">
        <div className="flex items-center justify-between gap-3 px-3 py-[10px] sm:px-5">
          <p className="min-w-0 truncate text-[14px]" aria-live="polite">
            {total > 0 ? (
              <>
                {start}-{end} of {total} results {heading}
              </>
            ) : (
              <>No results {heading}</>
            )}
          </p>
          {total > 0 && <SortSelect value={params.sort ?? "featured"} hrefs={Object.fromEntries(SORTS.map((s) => [s.value, withChange(params, { sort: s.value })]))} />}
        </div>
        {/* Mobile: filter button + active chips in a scrollable row */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 pb-[10px] lg:hidden">
          <FilterSheet count={chips.length}>{filters}</FilterSheet>
          {chips.map((c) => (
            <Chip key={c.label} {...c} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-6 px-3 sm:px-5">
        <aside className="hidden w-[230px] shrink-0 py-4 lg:block" aria-label="Filters">
          {filters}
        </aside>

        <div className="min-w-0 flex-1 py-4">
          {corrected && (
            <p className="mb-3 text-[16px]">
              Showing results for <Link href={toQuery({ ...params, k: corrected })} className="font-bold italic text-link hover:underline">{corrected}</Link>
              <br />
              <span className="text-[13px]">
                Search instead for <span className="text-link">{params.k}</span>
              </span>
            </p>
          )}

          {hasFilters && (
            <div className="mb-3 hidden flex-wrap items-center gap-2 lg:flex">
              {chips.map((c) => (
                <Chip key={c.label} {...c} />
              ))}
              <Link href={clearAll} className="link ml-1 text-[13px]">
                Clear all
              </Link>
            </div>
          )}

          {total === 0 ? (
            <NoResults query={params.k} clearHref={hasFilters ? clearAll : undefined} popular={topRated(() => true, 8)} />
          ) : (
            <>
              <h1 className="text-[20px] font-bold leading-[28px]">Results</h1>
              <p className="mb-2 text-[13px] text-muted">Check each product page for other buying options. Price and other details may vary based on product size and color.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {results.map((p, i) => (
                  <ResultCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
              {pageCount > 1 && <Pagination page={page} pageCount={pageCount} href={(n) => toQuery({ ...effective, page: n })} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`Remove filter ${label}`}
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[#8d9096] bg-[#f0f2f2] py-[4px] pl-3 pr-2 text-[13px] hover:bg-[#e3e6e6]"
    >
      {label}
      <X size={14} />
    </Link>
  );
}

function Box({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border ${on ? "border-link bg-link text-white" : "border-[#888c8c] bg-white"}`}>
      {on && <svg viewBox="0 0 12 12" className="h-[10px] w-[10px]"><path d="M2 6.5l2.5 2.5L10 3" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
    </span>
  );
}

function FilterPanel({
  params,
  brands,
  categories,
}: {
  params: SearchParams;
  brands: { name: string; count: number }[];
  categories: { slug: string; name: string; count: number }[];
}) {
  const heading = "mb-[6px] text-[14px] font-bold";
  const item = "flex items-center gap-2 py-[3px] text-[14px] hover:text-link-hover";
  const selectedBrands = params.brand ?? [];
  const visibleBrands = brands.slice(0, 8);
  const moreBrands = brands.slice(8);
  const brandLink = (b: string) =>
    withChange(params, { brand: selectedBrands.includes(b) ? selectedBrands.filter((x) => x !== b) : [...selectedBrands, b] });

  return (
    <div className="space-y-5">
      <section>
        <h2 className={heading}>Department</h2>
        <ul>
          {params.dept || params.cat ? (
            <li>
              <Link href={withChange(params, { dept: undefined, cat: undefined })} className="flex items-center py-[3px] text-[14px] hover:text-link-hover">
                ‹ Any Department
              </Link>
            </li>
          ) : null}
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={withChange(params, { cat: params.cat === c.slug ? undefined : c.slug })}
                aria-current={params.cat === c.slug ? "true" : undefined}
                className={`block py-[3px] pl-3 text-[14px] hover:text-link-hover ${params.cat === c.slug ? "font-bold" : ""}`}
              >
                {c.name} <span className="text-muted">({c.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={heading}>Customer Reviews</h2>
        <ul>
          {[4, 3, 2].map((r) => (
            <li key={r}>
              <Link href={withChange(params, { rating: params.rating === r ? undefined : r })} aria-current={params.rating === r ? "true" : undefined} className={item}>
                <span className="inline-flex" role="img" aria-label={`${r} stars & up`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={18} strokeWidth={1.2} className={i < r ? "fill-star text-star" : "text-star"} />
                  ))}
                </span>
                <span className={params.rating === r ? "font-bold" : ""}>& Up</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {brands.length > 0 && (
        <section>
          <h2 className={heading}>Brands</h2>
          <ul>
            {visibleBrands.map((b) => (
              <li key={b.name}>
                <Link href={brandLink(b.name)} className={item} role="checkbox" aria-checked={selectedBrands.includes(b.name)}>
                  <Box on={selectedBrands.includes(b.name)} /> {b.name}
                </Link>
              </li>
            ))}
          </ul>
          {moreBrands.length > 0 && (
            <details className="group">
              <summary className="link cursor-pointer list-none py-1 text-[13px] group-open:hidden">⌄ See more</summary>
              <ul>
                {moreBrands.map((b) => (
                  <li key={b.name}>
                    <Link href={brandLink(b.name)} className={item} role="checkbox" aria-checked={selectedBrands.includes(b.name)}>
                      <Box on={selectedBrands.includes(b.name)} /> {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      <section>
        <h2 className={heading}>Price</h2>
        <ul>
          {PRICE_BUCKETS.map((b) => (
            <li key={b.value}>
              <Link href={withChange(params, { price: params.price === b.value ? undefined : b.value })} aria-current={params.price === b.value ? "true" : undefined} className={`${item} ${params.price === b.value ? "font-bold" : ""}`}>
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={heading}>Deals & Discounts</h2>
        <Link href={withChange(params, { deals: !params.deals || undefined })} className={item} role="checkbox" aria-checked={!!params.deals}>
          <Box on={!!params.deals} /> Today&apos;s Deals
        </Link>
      </section>
    </div>
  );
}

function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (n: number) => string }) {
  const nums = [...new Set([1, page - 1, page, page + 1, pageCount])].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const base = "flex h-[42px] min-w-[42px] items-center justify-center rounded-lg border px-3 text-[14px]";
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${base} border-line hover:bg-[#f7fafa]`}>‹ Previous</Link>
      ) : (
        <span className={`${base} border-[#e7e7e7] text-[#8d9096]`}>‹ Previous</span>
      )}
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          {n === page ? (
            <span aria-current="page" className={`${base} border-ink font-bold`}>{n}</span>
          ) : (
            <Link href={href(n)} className={`${base} border-transparent hover:bg-[#f7fafa]`}>{n}</Link>
          )}
        </span>
      ))}
      {page < pageCount ? (
        <Link href={href(page + 1)} className={`${base} border-line hover:bg-[#f7fafa]`}>Next ›</Link>
      ) : (
        <span className={`${base} border-[#e7e7e7] text-[#8d9096]`}>Next ›</span>
      )}
    </nav>
  );
}
