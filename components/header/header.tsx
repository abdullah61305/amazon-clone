import Link from "next/link";
import { Suspense } from "react";
import { MapPin } from "lucide-react";
import { departments } from "@/lib/catalog";
import { Logo } from "@/components/ui";
import { SearchBar } from "@/components/header/search-bar";
import { CartLink } from "@/components/header/cart-link";
import { NavDrawer } from "@/components/header/nav-drawer";
import { AccountMenu } from "@/components/header/account-menu";

const deptLinks = departments.map((d) => ({ slug: d.slug, name: d.name, categories: d.categories }));

const beltLink = "rounded-sm border border-transparent px-[9px] py-[6px] hover:border-white";

export function Header() {
  return (
    <header className="sticky top-0 z-50 text-white">
      {/* Main belt */}
      <div className="bg-nav">
        <div className="flex h-[52px] items-center gap-1 px-2 sm:h-[60px] sm:gap-2 sm:px-3">
          <div className="sm:hidden">
            <NavDrawer departments={deptLinks} compact />
          </div>
          <Link href="/" className={`${beltLink} shrink-0 pt-[9px]`}>
            <Logo />
          </Link>
          <button type="button" className={`${beltLink} hidden shrink-0 items-end gap-[2px] text-left lg:flex`} aria-label="Delivering to New York 10001">
            <MapPin size={16} className="mb-[2px]" />
            <span className="flex flex-col leading-[15px]">
              <span className="text-[12px] text-[#ccc]">Deliver to</span>
              <span className="text-[14px] font-bold">New York 10001</span>
            </span>
          </button>
          <div className="mx-1 hidden flex-1 sm:flex">
            <Suspense fallback={<div className="h-10 flex-1 rounded-md bg-white" />}>
              <SearchBar departments={deptLinks} />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center sm:ml-0">
            <AccountMenu />
            <Link href="/orders" className={`${beltLink} hidden flex-col leading-[15px] md:flex`}>
              <span className="text-[12px]">Returns</span>
              <span className="text-[14px] font-bold">& Orders</span>
            </Link>
            <CartLink />
          </div>
        </div>
        {/* Mobile search row, as on Amazon's phone site */}
        <div className="px-3 pb-[10px] sm:hidden">
          <Suspense fallback={<div className="h-10 rounded-md bg-white" />}>
            <SearchBar departments={deptLinks} scoped={false} />
          </Suspense>
        </div>
      </div>
      {/* Secondary belt */}
      <nav aria-label="Departments" className="bg-nav-2">
        <div className="no-scrollbar flex h-[39px] items-center gap-0 overflow-x-auto px-2 text-[14px] sm:px-3">
          <div className="hidden sm:block">
            <NavDrawer departments={deptLinks} />
          </div>
          <Link href="/s?deals=1" className={`${beltLink} whitespace-nowrap`}>
            Today&apos;s Deals
          </Link>
          {deptLinks.map((d) => (
            <Link key={d.slug} href={`/s?dept=${d.slug}`} className={`${beltLink} whitespace-nowrap`}>
              {d.name}
            </Link>
          ))}
          <Link href="/s?sort=bestsellers" className={`${beltLink} whitespace-nowrap`}>
            Best Sellers
          </Link>
          <Link href="/s?sort=newest" className={`${beltLink} whitespace-nowrap`}>
            New Releases
          </Link>
        </div>
      </nav>
    </header>
  );
}
