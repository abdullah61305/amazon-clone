"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Menu, UserCircle2, X } from "lucide-react";
import { useAccount } from "@/lib/account";

type Dept = { slug: string; name: string; categories: { slug: string; name: string }[] };

const TRENDING = [
  { href: "/s?sort=bestsellers", label: "Best Sellers" },
  { href: "/s?sort=newest", label: "New Releases" },
  { href: "/s?deals=1", label: "Today's Deals" },
];

const ACCOUNT = [
  { href: "/orders", label: "Your Orders" },
  { href: "/cart", label: "Your Cart" },
];

/** The "All" department menu: a flat, keyboard-navigable left drawer with focus trap and focus return. */
export function NavDrawer({ departments, compact }: { departments: Dept[]; compact?: boolean }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLElement>("[data-menu-item]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const root = dialogRef.current;
    if (!root) return;
    if (e.key === "Tab") {
      const focusables = Array.from(root.querySelectorAll<HTMLElement>("a[href], button"));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-menu-item]"));
    if (!items.length) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : e.key === "ArrowDown" ? (i + 1) % items.length
      : i <= 0 ? items.length - 1 : i - 1;
    items[next].focus();
  };

  const row = "block px-9 py-[11px] text-[14px] text-ink hover:bg-[#eaeded]";
  const heading = "px-9 pb-2 pt-4 text-[18px] font-bold text-ink";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open all departments menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex items-center gap-1 rounded-sm border border-transparent px-[7px] py-[6px] font-bold hover:border-white"
      >
        <Menu size={compact ? 26 : 22} />
        {!compact && <span className="text-[14px]">All</span>}
      </button>
      {open && (
        <div
          ref={dialogRef}
          id={panelId}
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="All departments"
          onKeyDown={onKeyDown}
        >
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={close} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-[min(86vw,365px)] animate-slide-in-left flex-col bg-white">
            <div className="flex items-center gap-2 bg-nav-2 px-9 py-3 text-[19px] font-bold text-white">
              <UserCircle2 size={28} aria-hidden="true" />
              <span data-greeting className="truncate">Hello, {account ? account.name : "sign in"}</span>
            </div>
            <nav aria-label="Department menu" className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
              <h2 className={heading}>Trending</h2>
              <ul>
                {TRENDING.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} data-menu-item className={row} onClick={close}>{t.label}</Link>
                  </li>
                ))}
              </ul>
              <hr className="my-2 border-line" />
              <h2 className={heading}>Shop by Department</h2>
              <ul>
                {departments.map((d) => (
                  <li key={d.slug} className="pb-1">
                    <Link
                      href={`/s?dept=${d.slug}`}
                      data-menu-item
                      className="block px-9 pb-1 pt-[11px] text-[14px] font-bold text-ink hover:bg-[#eaeded]"
                      onClick={close}
                    >
                      {d.name}
                    </Link>
                    {d.categories.length > 0 && (
                      <ul aria-label={`${d.name} categories`} className="flex flex-wrap gap-x-3 gap-y-1 px-9 pb-2">
                        {d.categories.map((c) => (
                          <li key={c.slug}>
                            <Link
                              href={`/s?dept=${d.slug}&cat=${c.slug}`}
                              data-menu-item
                              className="text-[13px] text-link hover:text-link-hover hover:underline"
                              onClick={close}
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <hr className="my-2 border-line" />
              <h2 className={heading}>Help &amp; Settings</h2>
              <ul>
                {ACCOUNT.map((a) => (
                  <li key={a.href}>
                    <Link href={a.href} data-menu-item className={row} onClick={close}>{a.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <button
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
