"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";

export function CartLink() {
  const { count, ready } = useCart();
  const [seen, setSeen] = useState<number | null>(null);
  const [bump, setBump] = useState(0);
  // Pulse the icon when the count goes up after hydration (not on first load).
  if (ready && seen !== count) {
    if (seen !== null && count > seen) setBump((b) => b + 1);
    setSeen(count);
  }
  const shown = ready ? (count > 99 ? "99+" : String(count)) : "";
  return (
    <Link
      href="/cart"
      aria-label={ready ? `${count} items in cart` : "Cart"}
      className="relative flex min-h-[44px] items-end rounded-sm border border-transparent px-[6px] py-[4px] hover:border-white"
    >
      <span key={bump} className={`relative inline-block origin-bottom ${bump ? "animate-bump" : ""}`}>
        <svg width="40" height="30" viewBox="0 0 40 30" fill="none" aria-hidden>
          <path d="M2 4h5l5 17h19l4-12H11" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="26" r="2.4" fill="white" />
          <circle cx="29" cy="26" r="2.4" fill="white" />
        </svg>
        <span className="absolute left-[15px] top-[-9px] w-[20px] text-center text-[16px] font-bold leading-none text-[#f08804]">{shown}</span>
      </span>
      <span className="mb-[2px] hidden text-[14px] font-bold sm:inline">Cart</span>
    </Link>
  );
}
