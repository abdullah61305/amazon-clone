import data from "@/data/catalog.json";

export type VariationOption = { label: string; delta: number };
export type Variation = { name: string; options: VariationOption[] };
export type Review = { rating: number; comment: string; date: string; reviewerName: string };

export type Product = {
  id: number;
  slug: string;
  title: string;
  brand: string | null;
  description: string;
  department: string;
  category: string;
  price: number;
  listPrice: number | null;
  rating: number;
  reviewCount: number;
  boughtLastMonth: string | null;
  stock: number;
  badge: string | null;
  primeDays: number;
  warranty: string;
  returnPolicy: string;
  specs: Record<string, string>;
  tags: string[];
  images: string[];
  thumbnail: string;
  variation: Variation | null;
  reviews: Review[];
};

export type Category = { slug: string; name: string };
export type Department = { slug: string; name: string; categories: Category[] };

export const departments = data.departments as Department[];
export const products = data.products as Product[];

const byId = new Map(products.map((p) => [p.id, p]));
const categoryNames = new Map(departments.flatMap((d) => d.categories.map((c) => [c.slug, c.name])));
const departmentNames = new Map(departments.map((d) => [d.slug, d.name]));

export const getProduct = (id: number) => byId.get(id);
export const categoryName = (slug: string) => categoryNames.get(slug) ?? slug;
export const departmentName = (slug: string) => departmentNames.get(slug) ?? slug;
export const departmentOfCategory = (slug: string) => departments.find((d) => d.categories.some((c) => c.slug === slug));
export const productHref = (p: Pick<Product, "id" | "slug">) => `/dp/${p.id}/${p.slug}`;

export function discountPercent(p: Pick<Product, "price" | "listPrice">) {
  return p.listPrice ? Math.round((1 - p.price / p.listPrice) * 100) : 0;
}

// ---------- search ----------

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Avg. Customer Review" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "bestsellers", label: "Best Sellers" },
] as const;
export type Sort = (typeof SORTS)[number]["value"];

export const PRICE_BUCKETS = [
  { value: "0-25", label: "Under $25" },
  { value: "25-50", label: "$25 to $50" },
  { value: "50-100", label: "$50 to $100" },
  { value: "100-500", label: "$100 to $500" },
  { value: "500-", label: "$500 & above" },
];

export type SearchParams = {
  k?: string;
  dept?: string;
  cat?: string;
  brand?: string[];
  rating?: number;
  price?: string;
  deals?: boolean;
  sort?: Sort;
  page?: number;
};

export const PAGE_SIZE = 16;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Light stemming so "phones" matches "phone" and "watches" matches "watch".
const stem = (w: string) => (w.length > 4 && w.endsWith("es") ? w.slice(0, -2) : w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const tokens = (s: string) => normalize(s).split(" ").filter(Boolean).map(stem);

const haystacks = new Map(
  products.map((p) => {
    const dept = departments.find((d) => d.slug === p.department)!;
    return [
      p.id,
      {
        title: tokens(p.title),
        brand: tokens(p.brand ?? ""),
        meta: tokens([categoryName(p.category), p.category, dept.name, ...p.tags].join(" ")),
        text: tokens(p.description),
      },
    ];
  }),
);

function score(p: Product, q: string[]): number {
  if (!q.length) return 1;
  const h = haystacks.get(p.id)!;
  let total = 0;
  for (const t of q) {
    const hit = (list: string[]) => list.some((w) => w === t || (t.length >= 3 && w.startsWith(t)));
    const s = hit(h.title) ? 10 : hit(h.brand) ? 8 : hit(h.meta) ? 6 : hit(h.text) ? 2 : 0;
    if (!s) return 0; // every query word must match somewhere
    total += s;
  }
  return total;
}

function priceInBucket(price: number, bucket?: string) {
  if (!bucket) return true;
  const [min, max] = bucket.split("-");
  return price >= Number(min || 0) && (max === "" || max === undefined || price < Number(max));
}

export function search(params: SearchParams) {
  const q = tokens(params.k ?? "");
  const scored = products
    .map((p) => ({ p, s: score(p, q) }))
    .filter(({ p, s }) => s > 0 && (!params.dept || p.department === params.dept) && (!params.cat || p.category === params.cat));

  // Facets come from the query/department scope so a brand or price filter never hides its own alternatives.
  const brandCounts = new Map<string, number>();
  for (const { p } of scored) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const categoryCounts = new Map<string, number>();
  for (const { p } of scored) categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);

  const brands = params.brand ?? [];
  const filtered = scored.filter(
    ({ p }) =>
      (!brands.length || (p.brand && brands.includes(p.brand))) &&
      (!params.rating || p.rating >= params.rating) &&
      priceInBucket(p.price, params.price) &&
      (!params.deals || p.listPrice !== null),
  );

  const sort = params.sort ?? "featured";
  const sorters: Record<Sort, (a: (typeof filtered)[number], b: (typeof filtered)[number]) => number> = {
    featured: (a, b) => b.s - a.s || b.p.reviewCount * b.p.rating - a.p.reviewCount * a.p.rating,
    "price-asc": (a, b) => a.p.price - b.p.price,
    "price-desc": (a, b) => b.p.price - a.p.price,
    rating: (a, b) => b.p.rating - a.p.rating || b.p.reviewCount - a.p.reviewCount,
    newest: (a, b) => b.p.id - a.p.id,
    bestsellers: (a, b) => b.p.reviewCount - a.p.reviewCount,
  };
  filtered.sort(sorters[sort] ?? sorters.featured);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page ?? 1), pageCount);
  return {
    total,
    page,
    pageCount,
    results: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(({ p }) => p),
    brands: [...brandCounts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    categories: [...categoryCounts].sort((a, b) => b[1] - a[1]).map(([slug, count]) => ({ slug, name: categoryName(slug), count })),
  };
}

// ---------- suggestions & spelling ----------

const vocabulary = [...new Set([...haystacks.values()].flatMap((h) => [...h.title, ...h.brand, ...h.meta]).filter((w) => w.length > 2 && !/^\d+$/.test(w)))];

function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** Returns a corrected query when every word can be mapped to a close vocabulary word, e.g. "iphnoe" -> "iphone". */
export function didYouMean(query: string): string | null {
  const words = normalize(query).split(" ").filter(Boolean);
  if (!words.length) return null;
  let changed = false;
  const fixed = words.map((w) => {
    if (vocabulary.includes(stem(w))) return w;
    let best: string | null = null;
    let bestD = w.length > 5 ? 3 : 2;
    for (const v of vocabulary) {
      const d = editDistance(w, v);
      if (d < bestD) [best, bestD] = [v, d];
    }
    if (best) changed = true;
    return best ?? w;
  });
  const corrected = fixed.join(" ");
  return changed && search({ k: corrected }).total > 0 ? corrected : null;
}

export type Suggestion = { kind: "query"; text: string; department?: string } | { kind: "product"; id: number; slug: string; title: string; thumbnail: string };

export function suggest(query: string): Suggestion[] {
  const q = normalize(query);
  if (!q) return [];
  const { results } = search({ k: q, sort: "featured" });
  const queries = new Map<string, string | undefined>();
  // Complete the partial last word from product titles, then offer department-scoped searches.
  for (const p of results) {
    const t = normalize(p.title);
    const i = t.indexOf(q);
    if (i !== -1) {
      const completion = t.slice(i).split(" ").slice(0, q.split(" ").length + 1).join(" ");
      if (completion.length > q.length) queries.set(completion, undefined);
    }
    if (queries.size >= 5) break;
  }
  const topDept = results[0]?.department;
  if (topDept) queries.set(q, topDept);
  if (!queries.size) queries.set(q, undefined);
  return [
    ...[...queries].slice(0, 6).map(([text, department]): Suggestion => ({ kind: "query", text, department })),
    ...results.slice(0, 4).map((p): Suggestion => ({ kind: "product", id: p.id, slug: p.slug, title: p.title, thumbnail: p.thumbnail })),
  ];
}

export function related(p: Product, limit = 12) {
  return products
    .filter((o) => o.id !== p.id && (o.category === p.category || o.department === p.department))
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category) || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function topRated(filter: (p: Product) => boolean, limit = 12) {
  return products.filter(filter).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
}
