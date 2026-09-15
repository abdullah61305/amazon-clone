"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";

/** "Hello, sign in / Account & Lists" with Amazon's hover flyout (click/tap to toggle on touch). */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 120);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-sm border border-transparent px-[9px] py-[6px] text-left hover:border-white"
      >
        <span className="flex items-center gap-1 text-[14px] sm:hidden">
          Sign in ›<User size={24} />
        </span>
        <span className="hidden flex-col leading-[15px] sm:flex">
          <span className="text-[12px]">Hello, sign in</span>
          <span className="flex items-center text-[14px] font-bold">
            Account & Lists <ChevronDown size={12} className="ml-[2px] text-[#a7acb2]" />
          </span>
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 top-[99px] z-[-1] hidden bg-black/40 sm:block" aria-hidden />
          <div className="absolute right-[-60px] top-full z-50 mt-[6px] w-[min(92vw,470px)] animate-fade-in rounded-sm bg-white p-5 text-ink shadow-[0_2px_8px_rgba(0,0,0,.3)] sm:right-[-80px]">
            <div className="flex flex-col items-center border-b border-[#e7e7e7] pb-4">
              <button type="button" disabled className="btn-yellow w-[220px] rounded-lg">
                Sign in
              </button>
              <p className="mt-2 max-w-[260px] text-center text-[12px] text-muted">
                Sign-in isn&apos;t part of this demo. Your cart, saved items and orders are kept in this browser.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 text-[13px]">
              <div>
                <h3 className="mb-2 text-[16px] font-bold">Your Lists</h3>
                <ul className="space-y-[6px]">
                  <li><Link href="/cart#saved" className="hover:text-link-hover hover:underline" onClick={() => setOpen(false)}>Saved for Later</Link></li>
                  <li><Link href="/s?sort=bestsellers" className="hover:text-link-hover hover:underline" onClick={() => setOpen(false)}>Best Sellers</Link></li>
                </ul>
              </div>
              <div className="border-l border-[#e7e7e7] pl-6">
                <h3 className="mb-2 text-[16px] font-bold">Your Account</h3>
                <ul className="space-y-[6px]">
                  <li><Link href="/orders" className="hover:text-link-hover hover:underline" onClick={() => setOpen(false)}>Orders</Link></li>
                  <li><Link href="/cart" className="hover:text-link-hover hover:underline" onClick={() => setOpen(false)}>Shopping Cart</Link></li>
                  <li><Link href="/s?deals=1" className="hover:text-link-hover hover:underline" onClick={() => setOpen(false)}>Today&apos;s Deals</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
