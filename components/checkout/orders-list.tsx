"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { deliveryDate, usd } from "@/lib/format";
import { productHref } from "@/lib/catalog";

export function OrdersList() {
  const { orders, ready, add } = useCart();

  return (
    <div className="mx-auto w-full max-w-[920px] flex-1 px-4 py-5">
      <h1 className="text-[28px]">Your Orders</h1>
      {!ready ? (
        <div className="mt-4 space-y-3" aria-busy="true">
          <div className="skeleton h-36 w-full" />
          <div className="skeleton h-36 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-line px-4 py-12 text-center">
          <Package size={40} strokeWidth={1.3} className="text-muted" />
          <p className="text-[18px] font-bold">You haven&apos;t placed any orders yet</p>
          <Link href="/" className="btn-yellow px-6 py-2">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-5">
          {orders.map((o) => {
            const placed = new Date(o.placedAt);
            return (
              <li key={o.id} className="overflow-hidden rounded-lg border border-line">
                <div className="flex flex-wrap gap-x-8 gap-y-1 bg-[#f0f2f2] px-5 py-3 text-[12px] text-muted">
                  <div>
                    <p className="uppercase">Order placed</p>
                    <p className="text-[14px] text-ink">{placed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="uppercase">Total</p>
                    <p className="text-[14px] text-ink">{usd(o.total)}</p>
                  </div>
                  <div>
                    <p className="uppercase">Ship to</p>
                    <p className="text-[14px] text-link">{o.address.name}</p>
                  </div>
                  <p className="ml-auto self-center">Order # {o.id}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[18px] font-bold">Arriving {deliveryDate(o.delivery.days, placed)}</p>
                  <ul className="mt-3 space-y-4">
                    {o.lines.map((l) => (
                      <li key={l.key} className="flex gap-4">
                        <Link href={productHref({ id: l.productId, slug: l.slug })} className="relative h-[90px] w-[90px] shrink-0">
                          <Image src={l.image} alt="" fill sizes="90px" className="object-contain" />
                        </Link>
                        <div className="min-w-0 text-[14px]">
                          <Link href={productHref({ id: l.productId, slug: l.slug })} className="line-clamp-2 text-link hover:text-link-hover hover:underline">
                            {l.title}
                          </Link>
                          {l.variant && <p className="text-[12px] text-muted">{l.variant}</p>}
                          <p className="text-[12px]">Qty {l.qty} · {usd(l.price)}</p>
                          <button
                            type="button"
                            className="btn-yellow mt-2 py-1 text-[12px]"
                            onClick={() => add({ productId: l.productId, slug: l.slug, title: l.title, image: l.image, price: l.price, listPrice: l.listPrice, variant: l.variant, stock: l.stock })}
                          >
                            Buy it again
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
