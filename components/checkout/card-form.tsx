"use client";

import { useId, useState } from "react";
import { AlertCircle, Lock } from "lucide-react";
import {
  CardBrand,
  cardLength,
  cvcLength,
  cvcValid,
  detectBrand,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  onlyDigits,
  parseExpiry,
} from "@/lib/card";

export type CardSummary = { brand: CardBrand; last4: string; name: string };

type Key = "number" | "expiry" | "cvc" | "name" | "zip";
type Values = Record<Key, string>;
type Errors = Partial<Record<Key, string>>;

const ORDER: Key[] = ["number", "expiry", "cvc", "name", "zip"];

function check(key: Key, v: Values, now: Date): string | undefined {
  const brand = detectBrand(onlyDigits(v.number));
  switch (key) {
    case "number": {
      const digits = onlyDigits(v.number);
      if (!digits) return "Your card number is incomplete.";
      if (digits.length < cardLength(brand)) return luhnValid(digits) || digits.length < 13 ? "Your card number is incomplete." : "Your card number is invalid.";
      return luhnValid(digits) ? undefined : "Your card number is invalid.";
    }
    case "expiry": {
      const { mm, yy } = parseExpiry(v.expiry);
      if (mm.length < 2 || yy.length < 2) return "Your card's expiration date is incomplete.";
      const month = Number(mm);
      if (month < 1 || month > 12) return "Your card's expiration date is invalid.";
      return expiryValid(mm, yy, now) ? undefined : "Your card's expiration date is in the past.";
    }
    case "cvc":
      return cvcValid(v.cvc, brand) ? undefined : "Your card's security code is incomplete.";
    case "name":
      return v.name.trim().length >= 2 ? undefined : "Please enter the name on your card.";
    case "zip":
      return /^\d{5}$/.test(v.zip) ? undefined : "Your postal code is incomplete.";
  }
}

function validateAll(v: Values, now: Date) {
  const errors: Errors = {};
  for (const key of ORDER) {
    const message = check(key, v, now);
    if (message) errors[key] = message;
  }
  return errors;
}

const segment =
  "w-full bg-white px-3 py-[10px] text-[15px] text-[#30313d] outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-amzn) placeholder:text-[#87898f] border border-[#e6e6e6] focus:relative focus:z-10 focus:border-[#0570de] focus:shadow-[0_0_0_3px_rgba(5,112,222,.25)]";
const invalid = "relative z-[5] border-[#df1b41] text-[#df1b41] focus:border-[#df1b41] focus:shadow-[0_0_0_3px_rgba(223,27,65,.25)]";
const boxShadow = "shadow-[0_1px_1px_rgba(0,0,0,.03),0_3px_6px_rgba(0,0,0,.02)]";

export function CardForm({
  id,
  defaultName = "",
  defaultZip = "",
  onValidChange,
  onSubmit,
}: {
  id?: string;
  defaultName?: string;
  defaultZip?: string;
  onValidChange?: (summary: CardSummary | null) => void;
  onSubmit: (summary: CardSummary) => void;
}) {
  const uid = useId();
  const [values, setValues] = useState<Values>({ number: "", expiry: "", cvc: "", name: defaultName, zip: defaultZip });
  const [errors, setErrors] = useState<Errors>({});

  const brand = detectBrand(onlyDigits(values.number));
  const fid = (key: Key) => `${uid}-${key}`;
  const cardError = errors.number ?? errors.expiry ?? errors.cvc;

  const summaryOf = (v: Values): CardSummary => ({
    brand: detectBrand(onlyDigits(v.number)),
    last4: onlyDigits(v.number).slice(-4),
    name: v.name.trim(),
  });

  const commit = (next: Values, nextErrors: Errors) => {
    setValues(next);
    setErrors(nextErrors);
    onValidChange?.(Object.keys(validateAll(next, new Date())).length === 0 ? summaryOf(next) : null);
  };

  const update = (key: Key, raw: string) => {
    const next = { ...values, [key]: raw };
    const nextErrors = { ...errors };
    const now = new Date();
    if (nextErrors[key] && !check(key, next, now)) delete nextErrors[key];
    if (key === "number" && nextErrors.cvc && !check("cvc", next, now)) delete nextErrors.cvc;
    commit(next, nextErrors);
  };

  const blur = (key: Key) => {
    if (!values[key].trim()) return;
    const message = check(key, values, new Date());
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateAll(values, new Date());
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(fid(first))?.focus();
      return;
    }
    onSubmit(summaryOf(values));
  };

  const fillTestCard = () => {
    const yy = String((new Date().getFullYear() + 3) % 100).padStart(2, "0");
    commit(
      {
        number: "4242 4242 4242 4242",
        expiry: `12 / ${yy}`,
        cvc: "123",
        name: values.name.trim() ? values.name : defaultName || "Jordan Lee",
        zip: /^\d{5}$/.test(values.zip) ? values.zip : defaultZip || "10001",
      },
      {},
    );
  };

  const described = (key: Key, errId: string) => (errors[key] ? errId : undefined);

  return (
    <form id={id} onSubmit={submit} noValidate className="max-w-[440px] space-y-3 text-[#30313d]">
      <div>
        <label htmlFor={fid("number")} className="mb-1 block text-[14px] text-[#30313d]">
          Card information
        </label>
        <div className={`rounded-md ${boxShadow}`}>
          <div className="relative">
            <input
              id={fid("number")}
              name="cardnumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              aria-label="Card number"
              aria-invalid={!!errors.number}
              aria-describedby={described("number", `${uid}-card-err`)}
              value={values.number}
              onChange={(e) => update("number", formatCardNumber(e.target.value))}
              onBlur={() => blur("number")}
              className={`${segment} rounded-t-md pr-14 ${errors.number ? invalid : ""}`}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 z-20 -translate-y-1/2">
              <BrandIcon brand={brand} />
            </span>
          </div>
          <div className="-mt-px grid grid-cols-2">
            <input
              id={fid("expiry")}
              name="exp-date"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              aria-label="Expiration date"
              aria-invalid={!!errors.expiry}
              aria-describedby={described("expiry", `${uid}-card-err`)}
              value={values.expiry}
              onChange={(e) => update("expiry", formatExpiry(e.target.value))}
              onBlur={() => blur("expiry")}
              className={`${segment} rounded-bl-md ${errors.expiry ? invalid : ""}`}
            />
            <div className="relative -ml-px">
              <input
                id={fid("cvc")}
                name="cvc"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="CVC"
                maxLength={cvcLength(brand)}
                aria-label="Security code"
                aria-invalid={!!errors.cvc}
                aria-describedby={described("cvc", `${uid}-card-err`)}
                value={values.cvc}
                onChange={(e) => update("cvc", onlyDigits(e.target.value).slice(0, cvcLength(brand)))}
                onBlur={() => blur("cvc")}
                className={`${segment} rounded-br-md pr-12 ${errors.cvc ? invalid : ""}`}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 z-20 -translate-y-1/2">
                <CvcIcon brand={brand} error={!!errors.cvc} />
              </span>
            </div>
          </div>
        </div>
        {cardError && <ErrorLine id={`${uid}-card-err`} message={cardError} />}
      </div>

      <div>
        <label htmlFor={fid("name")} className="mb-1 block text-[14px]">
          Cardholder name
        </label>
        <input
          id={fid("name")}
          name="ccname"
          type="text"
          autoComplete="cc-name"
          placeholder="Full name on card"
          aria-invalid={!!errors.name}
          aria-describedby={described("name", `${uid}-name-err`)}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={() => blur("name")}
          className={`${segment} rounded-md ${boxShadow} ${errors.name ? invalid : ""}`}
        />
        {errors.name && <ErrorLine id={`${uid}-name-err`} message={errors.name} />}
      </div>

      <div className="max-w-[200px]">
        <label htmlFor={fid("zip")} className="mb-1 block text-[14px]">
          ZIP
        </label>
        <input
          id={fid("zip")}
          name="postal"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="12345"
          aria-invalid={!!errors.zip}
          aria-describedby={described("zip", `${uid}-zip-err`)}
          value={values.zip}
          onChange={(e) => update("zip", onlyDigits(e.target.value).slice(0, 5))}
          onBlur={() => blur("zip")}
          className={`${segment} rounded-md ${boxShadow} ${errors.zip ? invalid : ""}`}
        />
        {errors.zip && <ErrorLine id={`${uid}-zip-err`} message={errors.zip} />}
      </div>

      <p className="text-[12px] text-muted">
        Test card: 4242 4242 4242 4242 · any future date · any CVC{" "}
        <button type="button" onClick={fillTestCard} className="link font-bold">
          Use test card
        </button>
      </p>
      <p className="flex items-center gap-2 rounded-md bg-[#f7fafa] px-3 py-2 text-[12px] text-ink">
        <Lock size={14} className="shrink-0 text-muted" />
        Demo checkout — card details are not sent anywhere and nothing is charged.
      </p>
    </form>
  );
}

function ErrorLine({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1 flex animate-fade-in items-center gap-1 text-[13px] text-[#df1b41]">
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </p>
  );
}

export function BrandIcon({ brand, className = "" }: { brand: CardBrand; className?: string }) {
  const frame = `h-4 w-6 shrink-0 ${className}`;
  if (brand === "visa") {
    return (
      <svg viewBox="0 0 24 16" className={frame} role="img" aria-label="Visa">
        <rect width="24" height="16" rx="2.5" fill="#1a1f71" />
        <text x="12" y="11" textAnchor="middle" fontSize="7" fontWeight="700" fontStyle="italic" fontFamily="Arial, sans-serif" fill="#fff">
          VISA
        </text>
      </svg>
    );
  }
  if (brand === "mastercard") {
    return (
      <svg viewBox="0 0 24 16" className={frame} role="img" aria-label="Mastercard">
        <rect width="24" height="16" rx="2.5" fill="#252525" />
        <circle cx="9.5" cy="8" r="4.5" fill="#eb001b" />
        <circle cx="14.5" cy="8" r="4.5" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    );
  }
  if (brand === "amex") {
    return (
      <svg viewBox="0 0 24 16" className={frame} role="img" aria-label="American Express">
        <rect width="24" height="16" rx="2.5" fill="#2e77bc" />
        <text x="12" y="10.5" textAnchor="middle" fontSize="6" fontWeight="700" fontFamily="Arial, sans-serif" fill="#fff">
          AMEX
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 16" className={frame} aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="15" rx="2.5" fill="#f6f8fa" stroke="#c9ccd1" />
      <rect x="0.5" y="4" width="23" height="2.5" fill="#c9ccd1" />
      <rect x="3" y="10" width="7" height="2" rx="1" fill="#c9ccd1" />
    </svg>
  );
}

function CvcIcon({ brand, error }: { brand: CardBrand; error: boolean }) {
  const stroke = error ? "#df1b41" : "#87898f";
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="15" rx="2.5" fill="none" stroke={stroke} />
      {brand === "amex" ? (
        <rect x="14" y="3" width="7" height="4" rx="1" fill="none" stroke={stroke} />
      ) : (
        <>
          <rect x="0.5" y="3.5" width="23" height="2.5" fill={stroke} />
          <rect x="13" y="9" width="8" height="3.5" rx="1" fill="none" stroke={stroke} />
        </>
      )}
    </svg>
  );
}
