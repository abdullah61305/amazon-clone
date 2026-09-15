"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Lock, MapPin } from "lucide-react";
import { deliveryDays, type Product } from "@/lib/catalog";
import { deliveryDate, splitPrice, usd } from "@/lib/format";
import { MAX_QTY, useCart } from "@/components/cart/cart-context";
import { toCartLine } from "@/components/cart/quick-add";
import { Price, PrimeCheck } from "@/components/ui";

/**
 * Current time plus hours/minutes until a 10pm local cut-off ("Order within 4 hrs 12 mins").
 * Client-only: product pages are statically generated, so dates must not be baked in at build time.
 */
function useClock() {
  const [clock, setClock] = useState<{ now: Date; cutoff: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(22, 0, 0, 0);
      if (cutoff <= now) cutoff.setDate(cutoff.getDate() + 1);
      const mins = Math.floor((cutoff.getTime() - now.getTime()) / 60000);
      setClock({ now, cutoff: `${Math.floor(mins / 60)} hrs ${mins % 60} mins` });
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);
  return clock;
}

export function Purchase({ product: p, header, details }: { product: Product; header: React.ReactNode; details: React.ReactNode }) {
  const router = useRouter();
  const { add, lines, ready } = useCart();
  const [option, setOption] = useState(0);
  const [qty, setQty] = useState(1);
  const [unset, setUnset] = useState(p.variation?.name === "Size"); // sizes must be chosen explicitly
  const [needChoice, setNeedChoice] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const [buyVisible, setBuyVisible] = useState(true);
  const clock = useClock();

  const opt = p.variation?.options[option];
  const price = Math.round((p.price + (opt?.delta ?? 0)) * 100) / 100;
  const listPrice = p.listPrice ? Math.round((p.listPrice + (opt?.delta ?? 0)) * 100) / 100 : null;
  const off = listPrice ? Math.round((1 - price / listPrice) * 100) : 0;
  const variantLabel = p.variation && opt && !unset ? `${p.variation.name}: ${opt.label}` : null;
  const inCart = ready ? lines.filter((l) => l.productId === p.id).reduce((n, l) => n + l.qty, 0) : 0;
  const soldOut = p.stock === 0;
  const maxQty = Math.min(MAX_QTY, p.stock);
  const fastDays = p.primeDays;

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBuyVisible(e.isIntersecting), { rootMargin: "-100px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToCart = (thenCheckout = false) => {
    if (p.variation && unset) {
      setNeedChoice(true);
      document.getElementById("variation")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    add(toCartLine(p, price, variantLabel), qty);
    if (thenCheckout) router.push("/checkout");
    return true;
  };

  const { whole, cents } = splitPrice(price);

  return (
    <>
      {/* Center column */}
      <div className="mt-4 min-w-0 md:mt-0">
        {header}
        <hr className="my-3 hidden border-line md:block" />
        <div className="flex flex-wrap items-start gap-x-2">
          {off > 0 && <span className="text-[28px] font-light leading-none text-deal">-{off}%</span>}
          <Price value={price} size="lg" />
        </div>
        {listPrice && (
          <p className="mt-1 text-[12px] text-muted">
            List Price: <s>{usd(listPrice)}</s>
          </p>
        )}
        <div className="mt-1">
          <PrimeCheck />
        </div>
        <p className="mt-2 text-[14px]">
          <span className="link cursor-default">FREE Returns</span>
        </p>

        {p.variation && (
          <fieldset id="variation" className="mt-4 scroll-mt-32">
            <legend className="mb-2 text-[14px]">
              {p.variation.name}: <b>{unset ? <span className={needChoice ? "text-deal" : "text-muted"}>Select</span> : opt?.label}</b>
            </legend>
            <div className="flex flex-wrap gap-2">
              {p.variation.options.map((o, i) => {
                const selected = !unset && i === option;
                return (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setOption(i);
                      setUnset(false);
                      setNeedChoice(false);
                    }}
                    className={`min-w-[52px] rounded-lg border px-3 py-2 text-left text-[13px] transition-shadow ${selected ? "border-link bg-[#edfdff] shadow-[0_0_0_2px_#007185]" : "border-[#888c8c] hover:bg-[#f7fafa]"}`}
                  >
                    <span className="block font-bold">{o.label}</span>
                    {p.variation!.options.some((x) => x.delta) && <span className="block text-[12px]">{usd(p.price + o.delta)}</span>}
                  </button>
                );
              })}
            </div>
            {needChoice && <p className="mt-2 text-[13px] text-deal" role="alert">Please select a {p.variation.name.toLowerCase()} to continue.</p>}
          </fieldset>
        )}

        {details}
      </div>

      {/* Buy box: right column on desktop, inline on phones/tablets */}
      <div className="mt-6 md:col-span-2 lg:col-span-1 lg:mt-0">
        <div ref={buyRef} className="rounded-lg border border-line p-[18px] lg:sticky lg:top-[110px]">
          <p className="flex items-start leading-none" aria-label={`$${whole}.${cents}`}>
            <span className="relative top-[4px] text-[13px] leading-none">$</span>
            <span className="text-[28px] leading-none">{whole}</span>
            <span className="relative top-[4px] text-[13px] leading-none">{cents}</span>
          </p>
          {clock ? (
            <>
              <p className="mt-3 text-[14px] leading-[20px]">
                FREE delivery <b>{deliveryDate(deliveryDays(p), clock.now)}</b>. Order within <span className="text-stock">{clock.cutoff}</span>
              </p>
              <p className="mt-2 text-[14px] leading-[20px]">
                Or fastest delivery <b>{deliveryDate(fastDays, clock.now)}</b>
              </p>
            </>
          ) : (
            <div className="mt-3 space-y-2" aria-hidden>
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
            </div>
          )}
          <p className="mt-2 flex items-center gap-1 text-[12px] text-link">
            <MapPin size={14} /> Deliver to New York 10001
          </p>

          {soldOut ? (
            <p className="mt-3 text-[18px] text-deal">Currently unavailable.</p>
          ) : (
            <>
              <p className={`mt-3 text-[18px] ${p.stock <= 10 ? "text-deal" : "text-stock"}`}>
                {p.stock <= 10 ? `Only ${p.stock} left in stock - order soon.` : "In Stock"}
              </p>
              <label className="mt-3 flex w-fit items-center gap-2 rounded-lg border border-line bg-[#f0f2f2] px-3 py-[6px] text-[13px] shadow-[0_2px_5px_rgba(15,17,17,.15)]">
                Quantity:
                <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="cursor-pointer bg-transparent outline-none" aria-label="Quantity">
                  {Array.from({ length: maxQty }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-4 flex flex-col gap-2">
                <button type="button" className="btn-yellow w-full py-2 text-[13px]" onClick={() => addToCart()}>
                  Add to cart
                </button>
                <button type="button" className="btn-orange w-full py-2 text-[13px]" onClick={() => addToCart(true)}>
                  Buy Now
                </button>
              </div>
              {inCart > 0 && (
                <p className="mt-2 text-center text-[13px]" aria-live="polite">
                  <span className="text-stock">{inCart} in your cart</span> ·{" "}
                  <Link href="/cart" className="link">
                    View cart
                  </Link>
                </p>
              )}
            </>
          )}

          <p className="mt-3 flex items-center gap-1 text-[13px] text-link">
            <Lock size={13} /> Secure transaction
          </p>
          <dl className="mt-2 grid grid-cols-[80px_1fr] gap-y-1 text-[12px]">
            <dt className="text-muted">Ships from</dt>
            <dd>Amazon Clone</dd>
            <dt className="text-muted">Sold by</dt>
            <dd>{p.brand ?? "Amazon Clone"}</dd>
            <dt className="text-muted">Returns</dt>
            <dd className="text-link">{p.returnPolicy}</dd>
          </dl>
        </div>
      </div>

      {/* Phone: sticky add-to-cart once the buy box scrolls away */}
      {!soldOut && !buyVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex animate-rise items-center gap-3 border-t border-line bg-white px-3 py-2 shadow-[0_-2px_10px_rgba(0,0,0,.12)] lg:hidden">
          <Price value={price} size="sm" />
          <button type="button" className="btn-yellow flex-1 py-[9px]" onClick={() => addToCart()}>
            Add to cart
          </button>
        </div>
      )}
    </>
  );
}
