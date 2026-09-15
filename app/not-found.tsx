import Link from "next/link";
import { Header } from "@/components/header/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col items-center justify-center gap-4 bg-white px-4 py-20 text-center">
        <p className="text-[64px] font-bold leading-none text-[#e3e6e6]">404</p>
        <h1 className="text-[24px] font-bold">Sorry, we couldn&apos;t find that page</h1>
        <p className="max-w-[420px] text-[14px] text-muted">The link may be broken or the product may no longer be available. Try searching, or head back to the homepage.</p>
        <div className="flex gap-3">
          <Link href="/" className="btn-yellow px-6 py-2">
            Go to homepage
          </Link>
          <Link href="/s?sort=bestsellers" className="btn-white px-6 py-2">
            Browse best sellers
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
