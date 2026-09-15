import Link from "next/link";
import { departments } from "@/lib/catalog";
import { Logo } from "@/components/ui";
import { BackToTop } from "@/components/back-to-top";

export function Footer() {
  return (
    <footer className="mt-auto text-white">
      <BackToTop />
      <div className="bg-nav-2">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-8 px-6 py-10 text-[14px] md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-[16px] font-bold">Shop by Department</h3>
            <ul className="space-y-2 text-[#ddd]">
              {departments.map((d) => (
                <li key={d.slug}>
                  <Link href={`/s?dept=${d.slug}`} className="hover:underline">
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-[16px] font-bold">Discover</h3>
            <ul className="space-y-2 text-[#ddd]">
              <li><Link href="/s?deals=1" className="hover:underline">Today&apos;s Deals</Link></li>
              <li><Link href="/s?sort=bestsellers" className="hover:underline">Best Sellers</Link></li>
              <li><Link href="/s?sort=newest" className="hover:underline">New Releases</Link></li>
              <li><Link href="/s?rating=4" className="hover:underline">Top Rated</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-[16px] font-bold">Let Us Help You</h3>
            <ul className="space-y-2 text-[#ddd]">
              <li><Link href="/orders" className="hover:underline">Your Orders</Link></li>
              <li><Link href="/cart" className="hover:underline">Your Cart</Link></li>
              <li><Link href="/cart#saved" className="hover:underline">Saved for Later</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-[16px] font-bold">About this project</h3>
            <p className="text-[13px] leading-[19px] text-[#ddd]">
              A design and engineering study of the Amazon shopping experience. Not affiliated with Amazon. Product data from DummyJSON. Checkout is simulated — no payments are taken.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 border-t border-[#3a4553] bg-nav px-4 py-8 text-[12px] text-[#ddd]">
        <Link href="/">
          <Logo className="scale-90" />
        </Link>
        <p>Demo storefront · Prices and delivery dates are illustrative</p>
      </div>
    </footer>
  );
}
