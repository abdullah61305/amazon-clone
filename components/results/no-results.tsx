import Link from "next/link";
import { SearchX } from "lucide-react";
import { departments, Product } from "@/lib/catalog";
import { MiniCard } from "@/components/product-card";
import { Shelf } from "@/components/carousel";

/** Amazon shows unrelated sponsored products here; we help the shopper recover instead. */
export function NoResults({ query, clearHref, popular, suggestion }: { query?: string; clearHref?: string; popular: Product[]; suggestion?: string | null }) {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 rounded-lg border border-line p-5 sm:flex-row sm:items-start">
        <SearchX size={40} strokeWidth={1.4} className="shrink-0 text-muted" />
        <div>
          <h1 className="text-[20px] font-bold leading-[28px]">
            {query ? <>No results for &quot;{query}&quot;</> : "No products match these filters"}
          </h1>
          {suggestion && (
            <p className="mt-1 text-[16px]">
              Did you mean{" "}
              <Link href={`/s?k=${encodeURIComponent(suggestion)}`} className="link font-bold italic">
                {suggestion}
              </Link>
              ?
            </p>
          )}
          {clearHref ? (
            <p className="mt-1 text-[14px]">
              Your filters may be too narrow.{" "}
              <Link href={clearHref} className="link font-bold">
                Clear all filters
              </Link>{" "}
              to see more results.
            </p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px]">
              <li>Check the spelling or try fewer words</li>
              <li>Use a more general term, like &quot;phone&quot; instead of a model number</li>
              <li>Browse a department below</li>
            </ul>
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-6 text-[18px] font-bold">Shop by department</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {departments.map((d) => (
          <Link key={d.slug} href={`/s?dept=${d.slug}`} className="rounded-lg border border-line px-4 py-3 hover:border-[#8d9096] hover:bg-[#f7fafa]">
            <span className="block text-[15px] font-bold">{d.name}</span>
            <span className="text-[12px] text-muted">{d.categories.map((c) => c.name).slice(0, 3).join(" · ")}</span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-[18px] font-bold">Popular right now</h2>
      <Shelf label="Popular right now">
        {popular.map((p) => (
          <div key={p.id} className="snap-start">
            <MiniCard product={p} />
          </div>
        ))}
      </Shelf>
    </div>
  );
}
