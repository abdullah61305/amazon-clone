"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { deliveryDate, usd } from "@/lib/format";
import { productHref } from "@/lib/catalog";

export function Confirmation() {
  const id = useSearchParams().get("order");
  const { orders, ready } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-[900px] space-y-3 p-6" aria-busy="true">
        <div className="skeleton h-8 w-80" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return (
      <div className="mx-auto flex max-w-[600px] flex-col items-center gap-3 px-4 py-16 text-center">
        <h2 className="text-[24px] font-bold">We couldn&apos;t find that order</h2>
        <p className="text-[14px] text-muted">Orders are saved in the browser they were placed in.</p>
        <Link href="/orders" className="btn-yellow mt-2 px-6 py-2">
          Go to Your Orders
        </Link>
      </div>
    );
  }

  const placed = new Date(order.placedAt);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <section className="animate-rise rounded-lg border border-line p-5">
        <h2 className="flex items-center gap-2 text-[22px] font-bold text-[#067d62]">
          <CheckCircle2 size={28} className="fill-[#067d62] text-white" /> Order placed, thank you!
        </h2>
        <p className="mt-1 text-[14px]">Confirmation will be sent to your email. (Demo — no email is sent.)</p>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line pt-4 text-[14px] sm:grid-cols-3">
          <div>
            <p className="font-bold">Shipping to {order.address.name}</p>
            <p className="text-muted">
              {order.address.street}, {order.address.city}, {order.address.state.toUpperCase()} {order.address.zip}
            </p>
          </div>
          <div>
            <p className="font-bold text-stock">{deliveryDate(order.delivery.days, placed)}</p>
            <p className="text-muted">{order.delivery.label}</p>
          </div>
          <div>
            <p className="font-bold">Order # {order.id}</p>
            <p className="text-muted">Total {usd(order.total)}</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4">
          {order.lines.map((l) => (
            <li key={l.key}>
              <Link href={productHref({ id: l.productId, slug: l.slug })} className="relative block h-[90px] w-[90px] rounded border border-line" title={l.title}>
                <Image src={l.image} alt={l.title} fill sizes="90px" className="object-contain p-1" />
                {l.qty > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-nav-2 px-[6px] text-[11px] text-white">×{l.qty}</span>}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/orders" className="btn-white px-5 py-2">
            Review your orders
          </Link>
          <Link href="/" className="btn-yellow px-5 py-2">
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
