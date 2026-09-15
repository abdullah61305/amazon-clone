"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { SORTS } from "@/lib/catalog";

export function SortSelect({ value, hrefs }: { value: string; hrefs: Record<string, string> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const label = SORTS.find((s) => s.value === value)?.label ?? "Featured";
  return (
    <label className={`relative inline-flex shrink-0 items-center gap-1 rounded-lg border border-line bg-[#f0f2f2] px-[10px] py-[4px] text-[12px] shadow-[0_2px_5px_rgba(15,17,17,.15)] hover:bg-[#e3e6e6] ${pending ? "opacity-60" : ""}`}>
      <span className="text-ink">Sort by:</span> <span>{label}</span>
      <ChevronDown size={14} />
      <select
        aria-label="Sort by"
        value={value}
        onChange={(e) => start(() => router.push(hrefs[e.target.value]))}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
