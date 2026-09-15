import Link from "next/link";
import { categoryName, products, topRated, Product, productHref } from "@/lib/catalog";
import { Hero, Slide } from "@/components/home/hero";
import { Shelf } from "@/components/carousel";
import { MiniCard } from "@/components/product-card";
import { ProductImage } from "@/components/ui";

const bestOf = (category: string) => topRated((p) => p.category === category, 1)[0];
const thumbs = (category: string, n: number) => topRated((p) => p.category === category, n).map((p) => p.thumbnail);

const slides: Slide[] = [
  { eyebrow: "Tech that travels", title: "Phones, tablets & laptops for every budget", cta: "Shop Electronics", href: "/s?dept=electronics", from: "#0b3a8f", to: "#1d7fd6", images: [...thumbs("smartphones", 1), ...thumbs("laptops", 1), ...thumbs("tablets", 1)] },
  { eyebrow: "Fall refresh", title: "Easy updates for elevated spaces", cta: "Shop Home & Kitchen", href: "/s?dept=home-kitchen", from: "#6d3b1f", to: "#c97b3d", images: [...thumbs("furniture", 1), ...thumbs("home-decoration", 1), ...thumbs("kitchen-accessories", 1)] },
  { eyebrow: "Beauty week", title: "Glow-up favorites, up to 20% off", cta: "Shop Beauty", href: "/s?dept=beauty&deals=1", from: "#7b1f5c", to: "#e0588f", images: [...thumbs("fragrances", 1), ...thumbs("skin-care", 1), ...thumbs("beauty", 1)] },
];

function QuadCard({ title, items, link }: { title: string; items: { label: string; href: string; image: string }[]; link: { label: string; href: string } }) {
  return (
    <div className="card flex flex-col p-5 pb-4">
      <h2 className="mb-3 text-[21px] font-bold leading-[27px]">{title}</h2>
      <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
        {items.map((it) => (
          <Link key={it.label} href={it.href} className="group flex flex-col">
            <ProductImage src={it.image} alt="" sizes="150px" className="aspect-square" />
            <span className="mt-1 text-[12px] leading-[16px] group-hover:text-link-hover">{it.label}</span>
          </Link>
        ))}
      </div>
      <Link href={link.href} className="link mt-4 text-[13px]">
        {link.label}
      </Link>
    </div>
  );
}

function FeatureCard({ title, product, link }: { title: string; product: Product; link: { label: string; href: string } }) {
  return (
    <div className="card flex flex-col p-5 pb-4">
      <h2 className="mb-3 text-[21px] font-bold leading-[27px]">{title}</h2>
      <Link href={productHref(product)} className="relative min-h-[260px] flex-1 overflow-hidden">
        <ProductImage src={product.images[0]} alt={product.title} sizes="300px" className="absolute inset-0" />
      </Link>
      <Link href={link.href} className="link mt-4 text-[13px]">
        {link.label}
      </Link>
    </div>
  );
}

const categoryTiles = (cats: string[], dept: string) =>
  cats.map((c) => ({ label: categoryName(c), href: `/s?dept=${dept}&cat=${c}`, image: bestOf(c)?.thumbnail ?? "" }));

function ShelfSection({ title, items, href }: { title: string; items: Product[]; href: string }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-[21px] font-bold">{title}</h2>
        <Link href={href} className="link text-[13px]">
          See more
        </Link>
      </div>
      <Shelf label={title}>
        {items.map((p) => (
          <div key={p.id} className="snap-start">
            <MiniCard product={p} />
          </div>
        ))}
      </Shelf>
    </section>
  );
}

export default function HomePage() {
  const deals = products.filter((p) => p.listPrice).sort((a, b) => (b.listPrice! - b.price) / b.listPrice! - (a.listPrice! - a.price) / a.listPrice!);
  const under25 = topRated((p) => p.price < 25, 4);

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-[1500px]">
        <Hero slides={slides} />
        <div className="relative z-10 -mt-[40px] space-y-5 px-3 pb-6 sm:-mt-[180px] sm:px-5 lg:-mt-[330px]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <QuadCard title="Upgrade your everyday tech" items={categoryTiles(["smartphones", "laptops", "tablets", "mobile-accessories"], "electronics")} link={{ label: "Shop electronics", href: "/s?dept=electronics" }} />
            <QuadCard title="Easy updates for elevated spaces" items={categoryTiles(["furniture", "home-decoration", "kitchen-accessories", "sports-accessories"], "home-kitchen").map((t, i) => (i === 3 ? { ...t, href: "/s?dept=sports-outdoors" } : t))} link={{ label: "Shop home products", href: "/s?dept=home-kitchen" }} />
            <FeatureCard title="Most-loved fragrances" product={bestOf("fragrances")} link={{ label: "Discover more", href: "/s?dept=beauty&cat=fragrances" }} />
            <QuadCard
              title="Deals under $25"
              items={under25.map((p) => ({ label: p.title, href: productHref(p), image: p.thumbnail }))}
              link={{ label: "See all deals", href: "/s?price=0-25&sort=bestsellers" }}
            />
          </div>

          <ShelfSection title="Today's Deals" items={deals.slice(0, 16)} href="/s?deals=1" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <QuadCard title="Shop Fashion for less" items={categoryTiles(["womens-dresses", "tops", "womens-shoes", "womens-bags"], "womens-fashion")} link={{ label: "See more", href: "/s?dept=womens-fashion" }} />
            <QuadCard title="Level up your beauty routine" items={categoryTiles(["beauty", "skin-care", "fragrances", "womens-jewellery"], "beauty").map((t, i) => (i === 3 ? { ...t, href: "/s?dept=womens-fashion&cat=womens-jewellery" } : t))} link={{ label: "Shop beauty", href: "/s?dept=beauty" }} />
            <FeatureCard title="Get your game on" product={bestOf("sports-accessories")} link={{ label: "Shop sports & outdoors", href: "/s?dept=sports-outdoors" }} />
            <QuadCard title="Most-loved watches" items={categoryTiles(["mens-watches", "womens-watches", "sunglasses", "mens-shoes"], "mens-fashion").map((t, i) => (i === 1 ? { ...t, href: "/s?dept=womens-fashion&cat=womens-watches" } : t))} link={{ label: "Shop men's fashion", href: "/s?dept=mens-fashion" }} />
          </div>

          <ShelfSection title="Best Sellers in Electronics" items={topRated((p) => p.department === "electronics", 16)} href="/s?dept=electronics&sort=bestsellers" />
          <ShelfSection title="Best Sellers in Home & Kitchen" items={topRated((p) => p.department === "home-kitchen", 16)} href="/s?dept=home-kitchen&sort=bestsellers" />
          <ShelfSection title="Top rated in Beauty & Personal Care" items={topRated((p) => p.department === "beauty", 16)} href="/s?dept=beauty&sort=rating" />
        </div>
      </div>
    </div>
  );
}
