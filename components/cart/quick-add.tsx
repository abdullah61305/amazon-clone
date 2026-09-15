"use client";

import { Check } from "lucide-react";
import { Product } from "@/lib/catalog";
import { useCart } from "@/components/cart/cart-context";

export function toCartLine(p: Product, price = p.price, variant: string | null = null) {
  return {
    productId: p.id,
    slug: p.slug,
    title: p.title,
    image: p.thumbnail,
    price,
    listPrice: p.listPrice,
    variant,
    stock: p.stock,
  };
}

/** Results-page "Add to cart": adds instantly and turns into an in-place quantity indicator. */
export function QuickAddButton({ product }: { product: Product }) {
  const { add, lines, ready } = useCart();
  const inCart = ready ? lines.find((l) => l.productId === product.id)?.qty ?? 0 : 0;
  if (product.stock === 0) return <p className="text-[13px] text-deal">Currently unavailable.</p>;
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn-yellow w-full sm:w-auto" onClick={() => add(toCartLine(product))}>
        Add to cart
      </button>
      {inCart > 0 && (
        <span className="inline-flex animate-fade-in items-center gap-1 whitespace-nowrap text-[12px] text-stock" aria-live="polite">
          <Check size={14} /> {inCart} in cart
        </span>
      )}
    </div>
  );
}
