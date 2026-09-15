export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function splitPrice(n: number) {
  const [whole, cents] = n.toFixed(2).split(".");
  return { whole: Number(whole).toLocaleString("en-US"), cents };
}

export const compactCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

const DAY = 86_400_000;

/** Delivery date `days` business-ish days out, formatted like "Saturday, September 19". */
export function deliveryDate(days: number, from = new Date(), style: "long" | "short" = "long") {
  const d = new Date(from.getTime() + days * DAY);
  return d.toLocaleDateString("en-US", {
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}
