"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Banknote, Info, Loader2, Truck } from "lucide-react";
import { Order, useCart } from "@/components/cart/cart-context";
import { BrandIcon, CardForm, CardSummary } from "@/components/checkout/card-form";
import { BRAND_NAMES } from "@/lib/card";
import { deliveryDate, usd } from "@/lib/format";
import { useAccount } from "@/lib/account";
import { useDeliveryZip } from "@/lib/location";

type Address = Order["address"];

const DELIVERY = [
  { id: "standard", label: "Standard Delivery", days: 5, price: 0 },
  { id: "fast", label: "Fast Delivery", days: 2, price: 5.99, freeOver: 35 },
  { id: "overnight", label: "One-Day Delivery", days: 1, price: 12.99 },
] as const;

const TAX_RATE = 0.08875; // New York City combined rate
const PAYMENT = [
  { id: "card", label: "Credit or debit card", detail: "Visa, Mastercard, American Express · test cards only" },
  { id: "cod", label: "Pay on delivery", detail: "Cash or card when your order arrives" },
] as const;
const CARD_FORM_ID = "checkout-card-form";

const blankAddress: Address = { name: "", street: "", city: "", state: "", zip: "" };

function validate(a: Address) {
  const e: Partial<Record<keyof Address, string>> = {};
  if (a.name.trim().length < 2) e.name = "Please enter a name.";
  if (a.street.trim().length < 4) e.street = "Please enter a street address.";
  if (a.city.trim().length < 2) e.city = "Please enter a city.";
  if (!/^[A-Za-z]{2}$/.test(a.state.trim())) e.state = "Use a 2-letter state code.";
  if (!/^\d{5}$/.test(a.zip.trim())) e.zip = "Please enter a valid 5-digit ZIP code.";
  return e;
}

export function CheckoutFlow() {
  const router = useRouter();
  const { lines, ready, subtotal, count, placeOrder } = useCart();
  const account = useAccount();
  const { zip: deliveryZip, label: deliveryLabel, offset: zipOffset } = useDeliveryZip();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<Address>(blankAddress);
  const [touched, setTouched] = useState(false);
  const [payment, setPayment] = useState<(typeof PAYMENT)[number]["id"]>(PAYMENT[0].id);
  const [card, setCard] = useState<CardSummary | null>(null);
  const [delivery, setDelivery] = useState<(typeof DELIVERY)[number]["id"]>("standard");
  const [placing, setPlacing] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dates depend on the client clock
    setNow(new Date());
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-[1150px] space-y-4 p-4" aria-busy="true">
        <div className="skeleton h-8 w-72" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (lines.length === 0 && !placing) {
    return (
      <div className="mx-auto flex max-w-[600px] flex-col items-center gap-3 px-4 py-16 text-center">
        <h2 className="text-[24px] font-bold">Your cart is empty</h2>
        <p className="text-[14px] text-muted">Add something to your cart before checking out.</p>
        <Link href="/" className="btn-yellow mt-2 px-6 py-2">
          Continue shopping
        </Link>
      </div>
    );
  }

  const errors = validate(address);
  const addressValid = Object.keys(errors).length === 0;
  const option = DELIVERY.find((d) => d.id === delivery)!;
  const shipping = "freeOver" in option && subtotal >= option.freeOver ? 0 : option.price;
  const tax = Math.round((subtotal + shipping) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  const canPlace = step === 3 && addressValid && (payment === "cod" || !!card) && !placing;

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (addressValid) setStep(2);
  };

  const place = async () => {
    if (!canPlace) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900)); // simulated payment authorization
    const order = placeOrder({
      address,
      delivery: { label: option.label, days: option.days + zipOffset, price: shipping },
      subtotal,
      shipping,
      tax,
      total,
    });
    router.replace(`/checkout/thank-you?order=${order.id}`);
  };

  const summary = (
    <div className="rounded-lg border border-line p-4">
      <button type="button" onClick={place} disabled={!canPlace} className="btn-yellow w-full py-2 text-[14px]">
        {placing ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" /> Placing your order…
          </>
        ) : (
          "Place your order"
        )}
      </button>
      {step < 3 && <p className="mt-2 text-center text-[12px] text-muted">Complete the steps to place your order.</p>}
      <p className="mt-2 text-center text-[11px] text-muted">
        By placing your order, you agree this is a demo and nothing will be charged or shipped.
      </p>
      <hr className="my-3 border-line" />
      <h2 className="mb-2 text-[18px] font-bold">Order Summary</h2>
      {account && <p className="mb-2 text-[12px] text-muted">Ordering as <span className="font-bold text-ink">{account.name}</span> ({account.email})</p>}
      <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-[12px]">
        <dt>Items ({count}):</dt>
        <dd className="text-right">{usd(subtotal)}</dd>
        <dt>Shipping & handling:</dt>
        <dd className="text-right">{usd(shipping)}</dd>
        <dt className="pt-1">Total before tax:</dt>
        <dd className="border-t border-line pt-1 text-right">{usd(subtotal + shipping)}</dd>
        <dt>Estimated tax to be collected:</dt>
        <dd className="text-right">{usd(tax)}</dd>
      </dl>
      <hr className="my-3 border-line" />
      <p className="flex justify-between text-[18px] font-bold text-deal">
        <span>Order total:</span> <span>{usd(total)}</span>
      </p>
    </div>
  );

  return (
    <div className="mx-auto grid w-full max-w-[1150px] grid-cols-1 gap-6 px-4 py-5 md:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#0073bb] bg-[#f3f9fd] p-3 text-[13px]">
          <Info size={18} className="mt-[1px] shrink-0 text-[#0073bb]" />
          <p>
            <b>This is a demo checkout.</b> Use any address and the test card. Card details never leave this page and nothing is charged.
          </p>
        </div>

        {/* 1. Address */}
        <Step n={1} title="Delivery address" active={step === 1} done={step > 1} onChange={() => setStep(1)}
          summary={<p className="text-[14px]">{address.name}<br />{address.street}<br />{address.city}, {address.state.toUpperCase()} {address.zip}</p>}
        >
          <form onSubmit={submitAddress} noValidate className="grid max-w-[520px] grid-cols-2 gap-3">
            <Field label="Full name" name="name" autoComplete="name" value={address.name} error={touched ? errors.name : undefined} onChange={(v) => setAddress({ ...address, name: v })} className="col-span-2" />
            <Field label="Street address" name="street" autoComplete="street-address" placeholder="Street address or P.O. Box" value={address.street} error={touched ? errors.street : undefined} onChange={(v) => setAddress({ ...address, street: v })} className="col-span-2" />
            <Field label="City" name="city" autoComplete="address-level2" value={address.city} error={touched ? errors.city : undefined} onChange={(v) => setAddress({ ...address, city: v })} className="col-span-2 sm:col-span-1" />
            <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-1">
              <Field label="State" name="state" autoComplete="address-level1" autoCapitalize="characters" placeholder="NY" maxLength={2} value={address.state} error={touched ? errors.state : undefined} onChange={(v) => setAddress({ ...address, state: v })} />
              <Field label="ZIP Code" name="zip" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]*" enterKeyHint="done" maxLength={5} value={address.zip} error={touched ? errors.zip : undefined} onChange={(v) => setAddress({ ...address, zip: v.replace(/\D/g, "") })} />
            </div>
            <div className="col-span-2 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-yellow px-5 py-2">
                Use this address
              </button>
              <button
                type="button"
                className="text-[13px] text-link hover:text-link-hover hover:underline"
                onClick={() => {
                  setAddress({
                    name: account ? `${account.name} Lee` : "Jordan Lee",
                    street: "350 5th Ave",
                    city: deliveryLabel.replace(/\s*\d{5}$/, "") || "New York",
                    state: "NY",
                    zip: deliveryZip,
                  });
                  setTouched(false);
                }}
              >
                Fill a sample address
              </button>
            </div>
          </form>
        </Step>

        {/* 2. Payment */}
        <Step n={2} title="Payment method" active={step === 2} done={step > 2} onChange={() => setStep(2)} locked={step < 2}
          summary={
            payment === "card" && card ? (
              <p className="flex items-center gap-2 text-[14px]"><BrandIcon brand={card.brand} /> {BRAND_NAMES[card.brand]} ending in {card.last4}</p>
            ) : (
              <p className="flex items-center gap-2 text-[14px]"><Banknote size={18} /> Pay on delivery</p>
            )
          }
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">Payment method</legend>
            {PAYMENT.map((p) => (
              <div key={p.id} className={`rounded-lg border ${payment === p.id ? "border-[#fbd8b4] bg-[#fcf5ee]" : "border-line"}`}>
                <label className="flex cursor-pointer items-center gap-3 p-3">
                  <input type="radio" name="payment" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} className="h-4 w-4 accent-[#e77600]" />
                  <span>
                    <span className="block text-[14px] font-bold">{p.label}</span>
                    <span className="text-[12px] text-muted">{p.detail}</span>
                  </span>
                </label>
                {p.id === "card" && payment === "card" && (
                  <div className="animate-fade-in border-t border-[#fbd8b4] bg-white p-4 rounded-b-lg">
                    <CardForm
                      id={CARD_FORM_ID}
                      defaultName={address.name}
                      defaultZip={address.zip}
                      onSubmit={(summary) => {
                        setCard(summary);
                        setStep(3);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </fieldset>
          {payment === "card" ? (
            <button type="submit" form={CARD_FORM_ID} className="btn-yellow mt-4 px-5 py-2">
              Use this payment method
            </button>
          ) : (
            <button type="button" className="btn-yellow mt-4 px-5 py-2" onClick={() => setStep(3)}>
              Use this payment method
            </button>
          )}
        </Step>

        {/* 3. Review */}
        <Step n={3} title="Review items and delivery" active={step === 3} done={false} locked={step < 3}>
          <div className="rounded-lg border border-line">
            <div className="border-b border-line p-4">
              <p className="flex items-center gap-2 text-[16px] font-bold text-stock">
                <Truck size={18} /> Arriving {now ? deliveryDate(option.days + zipOffset, now) : "…"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_260px]">
              <ul className="space-y-4">
                {lines.map((l) => (
                  <li key={l.key} className="flex gap-3">
                    <div className="relative h-[80px] w-[80px] shrink-0">
                      <Image src={l.image} alt="" fill sizes="80px" className="object-contain" />
                    </div>
                    <div className="min-w-0 text-[14px]">
                      <p className="line-clamp-2 font-bold">{l.title}</p>
                      {l.variant && <p className="text-[12px] text-muted">{l.variant}</p>}
                      <p className="font-bold text-deal">{usd(l.price)}</p>
                      <p className="text-[12px]">Qty: {l.qty}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <fieldset>
                <legend className="mb-2 text-[14px] font-bold">Choose your delivery option:</legend>
                {DELIVERY.map((d) => {
                  const price = "freeOver" in d && subtotal >= d.freeOver ? 0 : d.price;
                  return (
                    <label key={d.id} className="flex cursor-pointer items-start gap-2 py-1 text-[14px]">
                      <input type="radio" name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)} className="mt-1 h-4 w-4 accent-[#e77600]" />
                      <span>
                        <b className="text-stock">{now ? deliveryDate(d.days + zipOffset, now) : "…"}</b>
                        <br />
                        <span className="text-muted">
                          {price === 0 ? "FREE" : usd(price)} – {d.label}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          </div>
        </Step>

        <div className="mt-6 md:hidden">{summary}</div>
      </div>
      <aside className="hidden md:block">
        <div className="sticky top-4">{summary}</div>
      </aside>
    </div>
  );
}

function Step({
  n,
  title,
  active,
  done,
  locked,
  onChange,
  summary,
  children,
}: {
  n: number;
  title: string;
  active: boolean;
  done: boolean;
  locked?: boolean;
  onChange?: () => void;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-4" aria-current={active ? "step" : undefined}>
      <div className="flex items-start gap-4">
        <div className="flex flex-1 gap-4">
          <span className={`text-[18px] font-bold ${locked ? "text-[#8d9096]" : active ? "text-[#c45500]" : "text-ink"}`}>{n}</span>
          <div className="flex-1">
            <h2 className={`text-[18px] font-bold ${locked ? "text-[#8d9096]" : active ? "text-[#c45500]" : "text-ink"}`}>{title}</h2>
            {done && summary && <div className="mt-1">{summary}</div>}
          </div>
        </div>
        {done && onChange && (
          <button type="button" onClick={onChange} className="text-[13px] text-link hover:text-link-hover hover:underline">
            Change
          </button>
        )}
      </div>
      {active && <div className="mt-3 animate-fade-in pl-0 sm:pl-8">{children}</div>}
    </section>
  );
}

function Field({
  label,
  error,
  onChange,
  className = "",
  ...input
}: { label: string; error?: string; onChange: (v: string) => void; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const id = `f-${input.name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-[13px] font-bold">
        {label}
      </label>
      <input
        id={id}
        {...input}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`field ${error ? "border-deal shadow-[0_0_0_3px_#fbe4e4]" : ""}`}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[12px] text-deal">
          ! {error}
        </p>
      )}
    </div>
  );
}
