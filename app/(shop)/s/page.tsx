import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  categoryName,
  departmentName,
  departments,
  didYouMean,
  PAGE_SIZE,
  PRICE_BUCKETS,
  productHref,
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
import { Chip, FilterLink, ResultsLink, ResultsRegion } from "@/components/results/filter-links";
import { HelpDecide, Pick } from "@/components/results/help-decide";

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
    exact: first(raw.exact) === "1",
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
  if (p.exact) sp.set("exact", "1");
  return `/s?${sp.toString()}`;
}

/** Any filter change resets pagination, like Amazon. Filters combine with AND. */
const withChange = (p: SearchParams, change: Partial<SearchParams>) => toQuery({ ...p, page: undefined, ...change });

export async function generateMetadata({ searchParams }: { searchParams: Promise<Raw> }): Promise<Metadata> {
  const p = parse(await searchParams);
  return { title: p.k ? `Amazon.com : ${p.k}` : p.dept ? departmentName(p.dept) : "Search results" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Raw> }) {
  const params = parse(await searchParams);
  let result = search(params);
  let corrected: string | null = null;
  // Amazon's pattern: auto-correct an obvious typo, but let the shopper search the original verbatim.
  if (result.total === 0 && params.k && !params.exact) {
    corrected = didYouMean(params.k);
    if (corrected) result = search({ ...params, k: corrected });
  }
  const effective = corrected ? { ...params, k: corrected } : params;
  const { total, page, pageCount, results, picks } = result;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(total, page * PAGE_SIZE);

  const chips: { label: string; href: string }[] = [];
  if (effective.dept && (effective.k || effective.cat)) chips.push({ label: departmentName(effective.dept), href: withChange(effective, { dept: undefined, cat: undefined }) });
  if (effective.cat) chips.push({ label: categoryName(effective.cat), href: withChange(effective, { cat: undefined }) });
  for (const b of effective.brand ?? []) chips.push({ label: b, href: withChange(effective, { brand: effective.brand!.filter((x) => x !== b) }) });
  if (effective.rating) chips.push({ label: `${effective.rating}★ & Up`, href: withChange(effective, { rating: undefined }) });
  if (effective.price) chips.push({ label: PRICE_BUCKETS.find((b) => b.value === effective.price)!.label, href: withChange(effective, { price: undefined }) });
  if (effective.deals) chips.push({ label: "Today's Deals", href: withChange(effective, { deals: undefined }) });
  const hasFilters = chips.length > 0;
  const clearAll = toQuery({ k: effective.k, dept: effective.k ? undefined : effective.dept, sort: effective.sort });

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

  const decide: Pick[] = picks.map(({ key, product: p, reason }) => ({
    key,
    label: key === "lowest" ? "Lowest price" : key === "rated" ? "Best rated" : "Best value",
    reason,
    product: { id: p.id, title: p.title, href: productHref(p), thumbnail: p.thumbnail, price: p.price, rating: p.rating, reviewCount: p.reviewCount },
  }));

  const filters = <FilterPanel params={effective} brands={result.brands} categories={result.categories} />;

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
          {total > 0 && <SortSelect value={effective.sort ?? "featured"} hrefs={Object.fromEntries(SORTS.map((s) => [s.value, withChange(effective, { sort: s.value })]))} />}
        </div>
        {/* Mobile: filter button + active chips in a scrollable row */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 pb-[10px] lg:hidden">
          <FilterSheet count={chips.length}>{filters}</FilterSheet>
          {chips.map((c) => (
            <Chip key={c.label} {...c} />
          ))}
          {hasFilters && (
            <ResultsLink href={clearAll} scroll={false} className="link shrink-0 whitespace-nowrap px-1 text-[13px]">
              Clear all
            </ResultsLink>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 px-3 sm:px-5">
        <aside className="hidden w-[230px] shrink-0 py-4 lg:block" aria-label="Filters">
          {filters}
        </aside>

        <div className="min-w-0 flex-1 py-4">
          <ResultsRegion>
            {corrected && (
              <p className="mb-3 text-[16px]">
                Showing results for <span className="font-bold italic text-[#c45500]">{corrected}</span>
                <br />
                <span className="text-[13px]">
                  Search instead for{" "}
                  <Link href={toQuery({ ...params, exact: true })} className="link">
                    {params.k}
                  </Link>
                </span>
              </p>
            )}

            {hasFilters && (
              <div className="mb-3 hidden flex-wrap items-center gap-2 lg:flex">
                {chips.map((c) => (
                  <Chip key={c.label} {...c} />
                ))}
                <ResultsLink href={clearAll} scroll={false} className="link ml-1 text-[13px]">
                  Clear all filters
                </ResultsLink>
              </div>
            )}

            {total === 0 ? (
              <NoResults query={params.k} clearHref={hasFilters ? clearAll : undefined} popular={topRated(() => true, 8)} />
            ) : (
              <>
                <h1 className="text-[20px] font-bold leading-[28px]">Results</h1>
                <p className="mb-3 text-[13px] text-muted">Check each product page for other buying options. Price and other details may vary based on product size and color.</p>
                {decide.length > 0 && <HelpDecide picks={decide} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {results.map((p, i) => (
                    <ResultCard key={p.id} product={p} priority={i < 4} />
                  ))}
                </div>
                {pageCount > 1 && <Pagination page={page} pageCount={pageCount} href={(n) => toQuery({ ...effective, page: n })} />}
              </>
            )}
          </ResultsRegion>
        </div>
      </div>
    </div>
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
  const item = "flex min-h-[30px] items-center gap-2 py-[3px] text-[14px] transition-colors duration-150 hover:text-link-hover lg:min-h-0";
  const selectedBrands = params.brand ?? [];
  const brandLink = (b: string) =>
    withChange(params, { brand: selectedBrands.includes(b) ? selectedBrands.filter((x) => x !== b) : [...selectedBrands, b] });
  const brandItem = (b: { name: string }) => (
    <li key={b.name}>
      <FilterLink href={brandLink(b.name)} on={selectedBrands.includes(b.name)} kind="check" className={item}>
        {b.name}
      </FilterLink>
    </li>
  );

  return (
    <div className="space-y-5">
      <section>
        <h2 className={heading}>Department</h2>
        <ul>
          {params.dept || params.cat ? (
            <li>
              <FilterLink href={withChange(params, { dept: undefined, cat: undefined })} on={false} kind="text" className={item}>
                ‹ Any Department
              </FilterLink>
            </li>
          ) : null}
          {categories.map((c) => (
            <li key={c.slug}>
              <FilterLink href={withChange(params, { cat: params.cat === c.slug ? undefined : c.slug })} on={params.cat === c.slug} kind="text" className={`${item} pl-3`}>
                {c.name} <span className="font-normal text-muted">({c.count})</span>
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={heading}>Customer Reviews</h2>
        <ul>
          {[4, 3, 2].map((r) => (
            <li key={r}>
              <FilterLink href={withChange(params, { rating: params.rating === r ? undefined : r })} on={params.rating === r} kind="text" className={item}>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex" role="img" aria-label={`${r} stars & up`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={18} strokeWidth={1.2} className={i < r ? "fill-star text-star" : "text-star"} />
                    ))}
                  </span>
                  & Up
                </span>
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>

      {brands.length > 0 && (
        <section>
          <h2 className={heading}>Brands</h2>
          <ul>{brands.slice(0, 8).map(brandItem)}</ul>
          {brands.length > 8 && (
            <details className="group">
              <summary className="link cursor-pointer list-none py-1 text-[13px] group-open:hidden">⌄ See more</summary>
              <ul>{brands.slice(8).map(brandItem)}</ul>
            </details>
          )}
        </section>
      )}

      <section>
        <h2 className={heading}>Price</h2>
        <ul>
          {PRICE_BUCKETS.map((b) => (
            <li key={b.value}>
              <FilterLink href={withChange(params, { price: params.price === b.value ? undefined : b.value })} on={params.price === b.value} kind="text" className={item}>
                {b.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={heading}>Deals & Discounts</h2>
        <FilterLink href={withChange(params, { deals: !params.deals || undefined })} on={!!params.deals} kind="check" className={item}>
          Today&apos;s Deals
        </FilterLink>
      </section>
    </div>
  );
}

function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (n: number) => string }) {
  const nums = [...new Set([1, page - 1, page, page + 1, pageCount])].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const base = "flex h-[42px] min-w-[42px] items-center justify-center rounded-lg border px-3 text-[14px] transition-colors duration-150";
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <ResultsLink href={href(page - 1)} className={`${base} border-line hover:bg-[#f7fafa]`}>‹ Previous</ResultsLink>
      ) : (
        <span aria-disabled="true" className={`${base} border-[#e7e7e7] text-[#8d9096]`}>‹ Previous</span>
      )}
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          {n === page ? (
            <span aria-current="page" className={`${base} border-ink font-bold`}>{n}</span>
          ) : (
            <ResultsLink href={href(n)} className={`${base} border-transparent hover:bg-[#f7fafa]`}>{n}</ResultsLink>
          )}
        </span>
      ))}
      {page < pageCount ? (
        <ResultsLink href={href(page + 1)} className={`${base} border-line hover:bg-[#f7fafa]`}>Next ›</ResultsLink>
      ) : (
        <span aria-disabled="true" className={`${base} border-[#e7e7e7] text-[#8d9096]`}>Next ›</span>
      )}
    </nav>
  );
}
