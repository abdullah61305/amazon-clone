"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Menu, UserCircle2, X } from "lucide-react";

type Dept = { slug: string; name: string; categories: { slug: string; name: string }[] };

/** The "All" hamburger drawer: department list with slide-in sub-menus, dimmed backdrop, Esc to close. */
export function NavDrawer({ departments, compact }: { departments: Dept[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<Dept | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setSub(null);
  };

  const row = "flex w-full items-center justify-between px-9 py-[13px] text-left text-[14px] text-ink hover:bg-[#eaeded]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open all categories menu"
        className="flex items-center gap-1 rounded-sm border border-transparent px-[7px] py-[6px] font-bold hover:border-white"
      >
        <Menu size={compact ? 26 : 22} />
        {!compact && <span className="text-[14px]">All</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="All categories">
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={close} />
          <div className="absolute inset-y-0 left-0 flex w-[min(86vw,365px)] animate-slide-in-left flex-col bg-white">
            <div className="flex items-center gap-2 bg-nav-2 px-9 py-3 text-[19px] font-bold text-white">
              <UserCircle2 size={28} /> Hello, sign in
            </div>
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
              {!sub ? (
                <div className="animate-fade-in">
                  <h2 className="px-9 pb-2 pt-4 text-[18px] font-bold">Trending</h2>
                  <Link href="/s?sort=bestsellers" className={row} onClick={close}>Best Sellers</Link>
                  <Link href="/s?sort=newest" className={row} onClick={close}>New Releases</Link>
                  <Link href="/s?deals=1" className={row} onClick={close}>Today&apos;s Deals</Link>
                  <hr className="my-2 border-line" />
                  <h2 className="px-9 pb-2 pt-3 text-[18px] font-bold">Shop by Department</h2>
                  {departments.map((d) => (
                    <button key={d.slug} type="button" className={row} onClick={() => setSub(d)}>
                      {d.name}
                      <ChevronRight size={18} className="text-muted" />
                    </button>
                  ))}
                  <hr className="my-2 border-line" />
                  <h2 className="px-9 pb-2 pt-3 text-[18px] font-bold">Help & Settings</h2>
                  <Link href="/orders" className={row} onClick={close}>Your Orders</Link>
                  <Link href="/cart" className={row} onClick={close}>Your Cart</Link>
                </div>
              ) : (
                <div className="animate-slide-in-right">
                  <button type="button" className="flex w-full items-center gap-3 border-b border-line px-9 py-3 text-[14px] font-bold text-ink hover:bg-[#eaeded]" onClick={() => setSub(null)}>
                    <ArrowLeft size={18} /> MAIN MENU
                  </button>
                  <h2 className="px-9 pb-2 pt-4 text-[18px] font-bold">{sub.name}</h2>
                  <Link href={`/s?dept=${sub.slug}`} className={row} onClick={close}>All {sub.name}</Link>
                  {sub.categories.map((c) => (
                    <Link key={c.slug} href={`/s?dept=${sub.slug}&cat=${c.slug}`} className={row} onClick={close}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute left-[min(86vw,365px)] top-2 ml-2 animate-fade-in p-1 text-white"
          >
            <X size={32} />
          </button>
        </div>
      )}
    </>
  );
}
