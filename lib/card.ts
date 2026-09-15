export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export const BRAND_NAMES: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  unknown: "Card",
};

export const onlyDigits = (input: string) => input.replace(/\D/g, "");

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "unknown";
}

export const cardLength = (brand: CardBrand) => (brand === "amex" ? 15 : 16);
export const cvcLength = (brand: CardBrand) => (brand === "amex" ? 4 : 3);

export function formatCardNumber(input: string) {
  const all = onlyDigits(input);
  const brand = detectBrand(all);
  const digits = all.slice(0, cardLength(brand));
  const groups = brand === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const parts: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + size));
    i += size;
  }
  return parts.join(" ");
}

export function formatExpiry(input: string) {
  let digits = onlyDigits(input);
  if (/^[2-9]/.test(digits)) digits = `0${digits}`;
  else if (/^1[3-9]/.test(digits)) digits = `0${digits}`;
  digits = digits.slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

export function parseExpiry(value: string) {
  const digits = onlyDigits(value);
  return { mm: digits.slice(0, 2), yy: digits.slice(2, 4) };
}

export function luhnValid(digits: string) {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function expiryValid(mm: string, yy: string, now: Date) {
  if (!/^\d{2}$/.test(mm) || !/^\d{2}$/.test(yy)) return false;
  const month = Number(mm);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(yy);
  const thisYear = now.getFullYear();
  return year > thisYear || (year === thisYear && month >= now.getMonth() + 1);
}

export function cvcValid(cvc: string, brand: CardBrand) {
  return new RegExp(`^\\d{${cvcLength(brand)}}$`).test(cvc);
}
