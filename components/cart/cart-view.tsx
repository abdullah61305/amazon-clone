"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { productHref } from "@/lib/catalog";
import { usd } from "@/lib/format";
import { CartLine, MAX_QTY, useCart } from "@/components/cart/cart-context";
import { Price, Stars } from "@/components/ui";

const FREE_SHIPPING = 35;

export function CartView({ recommendations }: { recommendations: Product[] }) {
  const cart = useCart();
  const { lines, saved, ready, count, subtotal, notice } = cart;

  if (!ready) return <CartSkeleton />;

  const empty = lines.length === 0;
  const remaining = FREE_SHIPPING - subtotal;

  const noticeBar = notice && (
            <div key={notice.title + notice.text} className="relative animate-rise overflow-hidden border-b border-line" role="status">
              <div className="flex flex-wrap items-center gap-x-2 py-3 text-[14px]">
                <span>
                  <span className="text-link">{notice.title.length > 60 ? `${notice.title.slice(0, 60)}…` : notice.title}</span> {notice.text}
                </span>
                <button type="button" className="btn-white min-h-[32px] px-4 py-[3px] font-bold" onClick={notice.undo}>
                  Undo
                </button>
              </div>
              {/* Visible time left to undo (matches the 8s timeout in cart-context). */}
              <div className="absolute inset-x-0 bottom-0 h-[3px] origin-left animate-countdown bg-link" aria-hidden />
            </div>
  );

  return (
    <div className="flex-1 bg-page px-2 py-4 sm:px-5">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="card px-4 pb-4 pt-5 sm:px-5" aria-labelledby="cart-heading">
            {empty && noticeBar}
            {empty ? (
              <div className="flex flex-col items-center gap-6 py-6 sm:flex-row sm:items-center sm:py-4">
                <EmptyCartArt />
                <div className="text-center sm:text-left">
                  <h1 id="cart-heading" className="text-[22px] font-bold sm:text-[28px]">
                    Your Amazon Cart is empty
                  </h1>
                  <Link href="/s?deals=1" className="link mt-1 inline-block text-[14px]">
                    Shop today&apos;s deals
                  </Link>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Link href="/" className="btn-yellow px-5 py-2">
                      Continue shopping
                    </Link>
                    {saved.length > 0 && (
                      <a href="#saved" className="btn-white px-5 py-2">
                        View saved items ({saved.length})
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between border-b border-line pb-1">
                  <h1 id="cart-heading" className="text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px]">
                    Shopping Cart
                  </h1>
                  <span className="hidden text-[14px] text-muted sm:block">Price</span>
                </div>
              </>
            )}

            {!empty && noticeBar}

            {!empty && (
              <>
                {/* Mobile: subtotal + checkout first, like Amazon's phone cart */}
                <div className="border-b border-line py-3 lg:hidden">
                  <p className="text-[18px]">
                    Subtotal <b>{usd(subtotal)}</b>
                  </p>
                  <FreeShipping remaining={remaining} />
                  <Link href="/checkout" className="btn-yellow mt-3 w-full py-[10px] text-[15px]">
                    Proceed to checkout ({count} {count === 1 ? "item" : "items"})
                  </Link>
                </div>
                <ul>
                  {lines.map((l) => (
                    <CartRow key={l.key} line={l} />
                  ))}
                </ul>
                <p className="pt-3 text-right text-[18px]">
                  Subtotal ({count} {count === 1 ? "item" : "items"}): <b>{usd(subtotal)}</b>
                </p>
              </>
            )}
          </section>

          {saved.length > 0 && (
            <section id="saved" className="card scroll-mt-28 p-4 sm:p-5" aria-labelledby="saved-heading">
              <h2 id="saved-heading" className="border-b border-line pb-2 text-[21px] font-bold">
                Saved for later ({saved.length} {saved.length === 1 ? "item" : "items"})
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {saved.map((l) => (
                  <li key={l.key} className="flex flex-col rounded-lg border border-line p-3">
                    <Link href={productHref({ id: l.productId, slug: l.slug })} className="relative block aspect-square">
                      <Image src={l.image} alt="" fill sizes="200px" className="object-contain" />
                    </Link>
                    <Link href={productHref({ id: l.productId, slug: l.slug })} className="mt-2 line-clamp-2 text-[14px] leading-[19px] hover:text-link-hover">
                      {l.title}
                    </Link>
                    {l.variant && <p className="text-[12px] text-muted">{l.variant}</p>}
                    <p className="mt-1 font-bold">{usd(l.price)}</p>
                    <p className="text-[12px] text-stock">In Stock</p>
                    <button type="button" className="btn-white mt-2 w-full" onClick={() => cart.moveToCart(l.key)}>
                      Move to cart
                    </button>
                    <button type="button" className="mt-2 text-[12px] text-link hover:text-link-hover hover:underline" onClick={() => cart.removeSaved(l.key)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="px-1 text-[12px] leading-[16px] text-ink">
            The price and availability of items are subject to change. The Cart is a temporary place to store a list of your items and reflects each item&apos;s most recent price.
          </p>
        </div>

        <aside className="space-y-5">
          {!empty && (
            <div className="card hidden p-5 lg:block">
              <FreeShipping remaining={remaining} />
              <p className="mt-2 text-[18px]">
                Subtotal ({count} {count === 1 ? "item" : "items"}): <b>{usd(subtotal)}</b>
              </p>
              <Link href="/checkout" className="btn-yellow mt-4 w-full py-2">
                Proceed to checkout
              </Link>
            </div>
          )}
          <div className="card p-5">
            <h2 className="mb-3 text-[16px] font-bold">Customers also bought</h2>
            <ul className="space-y-4">
              {recommendations
                .filter((p) => !lines.some((l) => l.productId === p.id))
                .slice(0, 4)
                .map((p) => (
                  <li key={p.id} className="flex gap-3">
                    <Link href={productHref(p)} className="relative h-[90px] w-[90px] shrink-0">
                      <Image src={p.thumbnail} alt="" fill sizes="90px" className="object-contain" />
                    </Link>
                    <div className="min-w-0 text-[13px]">
                      <Link href={productHref(p)} className="line-clamp-2 text-link hover:text-link-hover hover:underline">
                        {p.title}
                      </Link>
                      <Stars rating={p.rating} count={p.reviewCount} size={12} />
                      <Price value={p.price} size="sm" className="mt-1" />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FreeShipping({ remaining }: { remaining: number }) {
  return remaining > 0 ? (
    <div className="text-[13px]">
      <p>
        Add <b>{usd(remaining)}</b> of eligible items to your order for <b>FREE delivery</b>.
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7e7e7]" aria-hidden>
        <div className="h-full rounded-full bg-[#067d62] transition-[width]" style={{ width: `${Math.max(4, 100 - (remaining / FREE_SHIPPING) * 100)}%` }} />
      </div>
    </div>
  ) : (
    <p className="flex items-start gap-1 text-[13px] text-[#067d62]">
      <CheckCircle2 size={18} className="shrink-0 fill-[#067d62] text-white" />
      <span>
        Your order qualifies for FREE delivery. <span className="text-muted">Choose this option at checkout.</span>
      </span>
    </p>
  );
}

function CartRow({ line: l }: { line: CartLine }) {
  const { setQty, remove, saveForLater } = useCart();
  const href = productHref({ id: l.productId, slug: l.slug });
  const max = Math.min(MAX_QTY, l.stock);
  const action = "min-h-[32px] text-[13px] text-link hover:text-link-hover hover:underline sm:min-h-0 sm:text-[12px]";
  return (
    <li className="flex animate-fade-in gap-3 border-b border-line py-4 last:border-b-0 sm:gap-5">
      <Link href={href} className="relative h-[110px] w-[110px] shrink-0 sm:h-[180px] sm:w-[180px]">
        <Image src={l.image} alt="" fill sizes="180px" className="object-contain" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex gap-4">
          <Link href={href} className="line-clamp-2 flex-1 text-[16px] leading-[22px] hover:text-link-hover sm:text-[18px] sm:leading-[24px]">
            {l.title}
          </Link>
          <span className="hidden text-[18px] font-bold sm:block">{usd(l.price)}</span>
        </div>
        <p className="mt-1 text-[18px] font-bold sm:hidden">{usd(l.price)}</p>
        <p className={`mt-1 text-[12px] ${l.stock <= 10 ? "text-deal" : "text-stock"}`}>{l.stock <= 10 ? `Only ${l.stock} left in stock - order soon.` : "In Stock"}</p>
        <p className="text-[12px]">FREE delivery available at checkout</p>
        {l.variant && (
          <p className="text-[12px]">
            <b>{l.variant.split(":")[0]}:</b>
            {l.variant.split(":").slice(1).join(":")}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex h-[38px] items-center overflow-hidden rounded-full border-[3px] border-yellow sm:h-[32px]" role="group" aria-label="Quantity">
            {l.qty === 1 ? (
              <button type="button" aria-label={`Delete ${l.title}`} className="flex h-full w-[40px] items-center justify-center transition-colors hover:bg-[#f7fafa] active:bg-[#eaeded] sm:w-[32px]" onClick={() => remove(l.key)}>
                <Trash2 size={15} />
              </button>
            ) : (
              <button type="button" aria-label="Decrease quantity" className="flex h-full w-[40px] items-center justify-center transition-colors hover:bg-[#f7fafa] active:bg-[#eaeded] sm:w-[32px]" onClick={() => setQty(l.key, l.qty - 1)}>
                <Minus size={16} />
              </button>
            )}
            <span className="w-[28px] text-center text-[14px] font-bold" aria-live="polite">
              {l.qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={l.qty >= max}
              title={l.qty >= max ? `Limit ${max} per customer` : undefined}
              className="flex h-full w-[40px] items-center justify-center transition-colors hover:bg-[#f7fafa] active:bg-[#eaeded] disabled:cursor-not-allowed disabled:opacity-40 sm:w-[32px]"
              onClick={() => setQty(l.key, l.qty + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <button type="button" className={action} onClick={() => remove(l.key)}>
            Delete
          </button>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <button type="button" className={action} onClick={() => saveForLater(l.key)}>
            Save for later
          </button>
        </div>
        {l.qty >= max && <p className="mt-1 text-[12px] text-muted">Limit of {max} per customer.</p>}
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div className="flex-1 bg-page px-2 py-4 sm:px-5" aria-busy="true" aria-label="Loading cart">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="card space-y-4 p-5">
          <div className="skeleton h-8 w-48" />
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-5 border-t border-line pt-4">
              <div className="skeleton h-[140px] w-[140px] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-8 w-40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="card hidden h-[140px] space-y-3 p-5 lg:block">
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-9 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

function EmptyCartArt() {
  return (
    <svg viewBox="0 0 260 180" className="h-[140px] w-auto sm:h-[180px]" aria-hidden>
      <ellipse cx="130" cy="160" rx="120" ry="14" fill="#eaeded" />
      <path d="M40 40h28l22 78h96l20-58H78" fill="none" stroke="#a8b3b5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy="142" r="11" fill="#a8b3b5" />
      <circle cx="172" cy="142" r="11" fill="#a8b3b5" />
      <path d="M118 30c10-18 34-18 42 0" fill="none" stroke="#febd69" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
