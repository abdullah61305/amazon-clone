"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Price, ProductImage, Stars } from "@/components/ui";

export type Pick = {
  key: "lowest" | "rated" | "value";
  label: string;
  reason: string;
  product: { id: number; title: string; href: string; thumbnail: string; price: number; rating: number; reviewCount: number };
};

/** "Help me decide": one recommendation per shopping goal, computed from the current result set. */
export function HelpDecide({ picks }: { picks: Pick[] }) {
  const [active, setActive] = useState<Pick["key"]>(picks[0].key);
  const pick = picks.find((p) => p.key === active) ?? picks[0];

  return (
    <section aria-label="Help me decide" className="mb-4 rounded-lg border border-line bg-[#f7fafa] p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="flex items-center gap-1 text-[15px] font-bold">
          <Sparkles size={16} className="text-[#c45500]" /> Help me decide
        </h2>
        <div role="tablist" aria-label="Recommendation goal" className="flex gap-1 rounded-full bg-white p-[3px] shadow-[inset_0_0_0_1px_#d5d9d9]">
          {picks.map((p) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={p.key === active}
              onClick={() => setActive(p.key)}
              className={`min-h-[30px] rounded-full px-3 text-[13px] transition-colors duration-150 ease-(--ease-amzn) ${p.key === active ? "bg-nav-2 text-white" : "text-ink hover:bg-[#f0f2f2]"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <Link key={pick.key} href={pick.product.href} role="tabpanel" className="group mt-3 flex animate-fade-in items-center gap-3">
        <ProductImage src={pick.product.thumbnail} alt="" sizes="72px" className="h-[72px] w-[72px] shrink-0 rounded bg-white" />
        <div className="min-w-0">
          <p className="line-clamp-1 text-[14px] font-bold group-hover:text-link-hover">{pick.product.title}</p>
          <div className="flex flex-wrap items-center gap-x-3">
            <Price value={pick.product.price} size="sm" />
            <Stars rating={pick.product.rating} count={pick.product.reviewCount} size={13} />
          </div>
          <p className="mt-1 text-[13px] text-muted">{pick.reason}</p>
        </div>
      </Link>
    </section>
  );
}
