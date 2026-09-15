"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { usd } from "@/lib/format";

const FREE_SHIPPING = 35;

/**
 * Replaces Amazon's blocking protection-plan interstitial with a non-blocking confirmation:
 * the shopper keeps their place, sees the subtotal and can go straight to checkout.
 */
export function AddedToCartPanel() {
  const { added, dismissAdded, subtotal, count } = useCart();
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const lastPath = useRef(pathname);
  const addedKey = added ? `${added.line.key}-${added.line.qty}` : "";
  const [shownKey, setShownKey] = useState(addedKey);
  if (shownKey !== addedKey) {
    setShownKey(addedKey);
    setLeaving(false);
  }

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(dismissAdded, 160);
  }, [dismissAdded]);

  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      dismissAdded();
    }
  }, [pathname, dismissAdded]);

  useEffect(() => {
    if (!added || hover) return;
    const t = setTimeout(close, 6000);
    return () => clearTimeout(t);
  }, [added, hover, close]);

  if (!added || pathname === "/cart" || pathname.startsWith("/checkout")) return null;
  const { line } = added;
  const remaining = FREE_SHIPPING - subtotal;

  return (
    <aside
      key={shownKey}
      aria-live="polite"
      aria-label="Added to cart"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`fixed inset-x-0 bottom-0 z-[60] ${leaving ? "animate-sink" : "animate-rise"} rounded-t-xl border border-line bg-white p-4 shadow-[0_-4px_24px_rgba(15,17,17,.25)] sm:bottom-auto sm:left-auto sm:right-4 sm:top-[108px] sm:w-[380px] sm:rounded-lg sm:shadow-[0_4px_24px_rgba(15,17,17,.25)]`}
    >
      <button type="button" onClick={close} aria-label="Close" className="absolute right-2 top-2 rounded-full p-1 text-muted hover:bg-[#f0f2f2]">
        <X size={18} />
      </button>
      <div className="flex gap-3">
        <Image src={line.image} alt="" width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded bg-[#f7f7f7] object-contain" />
        <div className="min-w-0 pr-5">
          <p className="flex items-center gap-1 text-[18px] font-bold text-stock">
            <CheckCircle2 size={20} className="fill-stock text-white" /> Added to cart
          </p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[18px]">{line.title}</p>
          {line.variant && <p className="text-[12px] text-muted">{line.variant}</p>}
        </div>
      </div>
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-[18px]">
          Cart subtotal <span className="text-[13px] text-muted">({count} {count === 1 ? "item" : "items"})</span>:{" "}
          <b>{usd(subtotal)}</b>
        </p>
        <p className="mt-1 text-[13px] text-stock">
          {remaining > 0 ? (
            <span className="text-muted">
              Add <b className="text-ink">{usd(remaining)}</b> of eligible items for FREE delivery.
            </span>
          ) : (
            "Your order qualifies for FREE delivery."
          )}
        </p>
        <div className="mt-3 flex gap-2">
          <Link href="/checkout" className="btn-yellow flex-1">
            Proceed to checkout
          </Link>
          <Link href="/cart" className="btn-white flex-1">
            Go to Cart
          </Link>
        </div>
      </div>
    </aside>
  );
}
