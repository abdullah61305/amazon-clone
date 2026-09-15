import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { topRated } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shopping Cart" };

export default function CartPage() {
  return <CartView recommendations={topRated(() => true, 8)} />;
}
