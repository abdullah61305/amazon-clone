"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Suggestion } from "@/lib/catalog";

type Dept = { slug: string; name: string };

export function SearchBar({ departments }: { departments: Dept[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("k") ?? "");
  const [dept, setDept] = useState(params.get("dept") ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the box in sync when navigating between result pages (back/forward, chips, "did you mean").
  const urlK = params.get("k") ?? "";
  const urlDept = params.get("dept") ?? "";
  const [synced, setSynced] = useState({ urlK, urlDept });
  if (synced.urlK !== urlK || synced.urlDept !== urlDept) {
    setSynced({ urlK, urlDept });
    setQuery(urlK);
    setDept(urlDept);
  }

  useEffect(() => {
    const q = query.trim();
    if (!q || !focused) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        setItems(await res.json());
        setActive(-1);
        setOpen(true);
      } catch {
        // Suggestions are an enhancement: on failure the plain search still works.
        if (!ctrl.signal.aborted) setItems([]);
      }
    }, 120);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, focused]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (k: string, d = dept) => {
    const q = k.trim();
    setOpen(false);
    inputRef.current?.blur();
    const sp = new URLSearchParams();
    if (q) sp.set("k", q);
    if (d) sp.set("dept", d);
    router.push(`/s?${sp.toString()}`);
  };

  const choose = (s: Suggestion) => {
    if (s.kind === "product") {
      setOpen(false);
      router.push(`/dp/${s.id}/${s.slug}`);
    } else {
      setQuery(s.text);
      go(s.text, s.department ?? dept);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(items[active]);
    }
  };

  const q = query.trim().toLowerCase();
  const queries = items.filter((s): s is Extract<Suggestion, { kind: "query" }> => s.kind === "query");
  const productsList = items.filter((s): s is Extract<Suggestion, { kind: "product" }> => s.kind === "product");
  const deptLabel = departments.find((d) => d.slug === dept)?.name ?? "All";
  const showList = open && focused && q.length > 0 && items.length > 0;

  return (
    <div ref={wrapRef} className="relative flex-1">
      {showList && <div className="fixed inset-0 top-[var(--header-h,60px)] z-30 bg-black/40 animate-fade-in" aria-hidden />}
      <form
        role="search"
        className="relative z-40 flex h-10 w-full overflow-hidden rounded-md bg-white focus-within:ring-[3px] focus-within:ring-[#f90]"
        onSubmit={(e) => {
          e.preventDefault();
          go(active >= 0 && items[active]?.kind === "query" ? (items[active] as { text: string }).text : query);
        }}
      >
        <label className="relative hidden shrink-0 cursor-pointer items-center border-r border-[#cdcdcd] bg-[#e6e6e6] text-[12px] text-[#555] hover:bg-[#d4d4d4] hover:text-ink sm:flex">
          <span className="pointer-events-none flex items-center gap-1 pl-[9px] pr-[7px]">
            {deptLabel}
            <ChevronDown size={12} />
          </span>
          <select
            aria-label="Select the department you want to search in"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <input
          ref={inputRef}
          type="text"
          name="k"
          value={query}
          placeholder="Search Amazon"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search Amazon"
          className="min-w-0 flex-1 px-[10px] text-[15px] text-ink outline-none placeholder:text-[#6f7373]"
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) setOpen(false);
          }}
          onFocus={() => {
            setFocused(true);
            if (items.length) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKey}
        />
        <button type="submit" aria-label="Go" className="flex w-[45px] shrink-0 items-center justify-center bg-search text-ink hover:bg-search-hover">
          <Search size={22} strokeWidth={2.4} />
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[40px] z-40 overflow-hidden rounded-b-md border border-[#cdcdcd] bg-white py-1 shadow-[0_2px_4px_rgba(0,0,0,.13)]"
          onMouseDown={(e) => e.preventDefault()}
        >
          {queries.map((s, i) => {
            const idx = s.text.indexOf(q);
            const before = idx >= 0 ? s.text.slice(0, idx + q.length) : "";
            const after = idx >= 0 ? s.text.slice(idx + q.length) : s.text;
            return (
              <li
                key={`q-${s.text}-${s.department ?? ""}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                className={`flex cursor-pointer items-center gap-2 px-[10px] py-[5px] text-[15px] ${active === i ? "bg-[#eaeded]" : "hover:bg-[#eaeded]"}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(s)}
              >
                <Search size={14} className="shrink-0 text-muted" />
                <span className="truncate">
                  {before}
                  <b>{after}</b>
                  {s.department && (
                    <span className="text-[13px] text-link"> in {departments.find((d) => d.slug === s.department)?.name}</span>
                  )}
                </span>
              </li>
            );
          })}
          {productsList.length > 0 && (
            <li role="presentation" className="mt-1 border-t border-[#e7e7e7] px-[10px] pb-1 pt-2 text-[12px] font-bold uppercase text-muted">
              Products
            </li>
          )}
          {productsList.map((s, j) => {
            const i = queries.length + j;
            return (
              <li
                key={`p-${s.id}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                className={`flex cursor-pointer items-center gap-3 px-[10px] py-[4px] text-[14px] ${active === i ? "bg-[#eaeded]" : "hover:bg-[#eaeded]"}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(s)}
              >
                <Image src={s.thumbnail} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded bg-[#f7f7f7] object-contain" />
                <span className="truncate">{s.title}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
