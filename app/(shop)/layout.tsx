import { Header } from "@/components/header/header";
import { Footer } from "@/components/footer";
import { AddedToCartPanel } from "@/components/cart/added-panel";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
      <AddedToCartPanel />
    </>
  );
}
