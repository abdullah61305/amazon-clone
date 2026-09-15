import Link from "next/link";
import { ChevronsUpDown, Globe } from "lucide-react";
import { Logo } from "@/components/ui";
import { BackToTop } from "@/components/back-to-top";

type FooterLink = { label: string; href: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About this storefront", href: "/" },
      { label: "Best Sellers", href: "/s?sort=bestsellers" },
      { label: "New Releases", href: "/s?sort=newest" },
      { label: "Top Rated", href: "/s?rating=4" },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Shop Electronics", href: "/s?dept=electronics" },
      { label: "Today's Deals", href: "/s?deals=1" },
      { label: "Shop All Departments", href: "/s" },
      { label: "Discover Popular Picks", href: "/s?sort=bestsellers" },
    ],
  },
  {
    title: "Amazon Payment Products",
    links: [
      { label: "Deals & Savings", href: "/s?deals=1" },
      { label: "Checkout from Cart", href: "/cart" },
      { label: "Deals Under $25", href: "/s?price=0-25&sort=price-asc" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Orders", href: "/orders" },
      { label: "Your Cart", href: "/cart" },
      { label: "Saved for Later", href: "/cart#saved" },
      { label: "Help", href: "/" },
    ],
  },
];

const legalLinks: FooterLink[] = [
  { label: "Conditions of Use", href: "/" },
  { label: "Privacy Notice", href: "/" },
  { label: "Your Ads Privacy Choices", href: "/" },
];

export function Footer() {
  return (
    <footer className="mt-auto text-white">
      <BackToTop />
      <div className="bg-nav-2">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-x-8 gap-y-10 px-6 pt-10 pb-12 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-[10px] text-[16px] leading-[20px] font-bold">{col.title}</h3>
              <ul className="space-y-[9px] text-[14px] leading-[18px] text-[#dddddd]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#3a4553]">
          <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-8">
            <Link href="/" className="rounded-sm">
              <Logo className="scale-90" />
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[14px] text-[#cccccc]" aria-hidden="true">
              <span className="inline-flex items-center gap-2 rounded-[3px] border border-[#848688] px-3 py-[6px]">
                <Globe className="size-4" strokeWidth={1.75} />
                English
                <ChevronsUpDown className="size-3.5" />
              </span>
              <span className="inline-flex items-center gap-2 rounded-[3px] border border-[#848688] px-3 py-[6px]">
                <span className="relative inline-block h-[11px] w-4 overflow-hidden rounded-[1px] bg-[repeating-linear-gradient(to_bottom,#b22234_0_1.57px,#ffffff_1.57px_3.14px)]">
                  <span className="absolute top-0 left-0 h-[6px] w-[7px] bg-[#3c3b6e]" />
                </span>
                United States
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#131a22] px-4 pt-6 pb-8 text-center text-[12px] text-[#dddddd]">
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {legalLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2">Demo storefront · Not affiliated with Amazon.com · Product data from DummyJSON</p>
        <p className="mt-1 text-[#999999]">Prices, delivery dates and checkout are simulated — no payments are taken.</p>
      </div>
    </footer>
  );
}
