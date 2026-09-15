import Link from "next/link";
import { Lock } from "lucide-react";
import { Logo } from "@/components/ui";

/** Amazon strips the store chrome during checkout: logo, "Secure checkout", cart link. */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-nav text-white">
        <div className="mx-auto flex h-[60px] max-w-[1150px] items-center justify-between px-4">
          <Link href="/" className="rounded-sm border border-transparent px-2 pt-2 hover:border-white">
            <Logo />
          </Link>
          <h1 className="flex items-center gap-2 text-[20px] sm:text-[24px]">
            Secure checkout <Lock size={18} className="text-[#a7acb2]" />
          </h1>
          <Link href="/cart" className="rounded-sm border border-transparent px-2 py-1 text-[14px] hover:border-white">
            Cart
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col bg-white">
        {children}
      </main>
      <footer className="border-t border-line bg-[#f7f7f7] px-4 py-6 text-center text-[12px] text-muted">
        Demo checkout — no payment is taken and no order is shipped. Not affiliated with Amazon.
      </footer>
    </>
  );
}
