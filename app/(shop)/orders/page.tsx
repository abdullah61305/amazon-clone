import type { Metadata } from "next";
import { OrdersList } from "@/components/checkout/orders-list";

export const metadata: Metadata = { title: "Your Orders" };

export default function OrdersPage() {
  return <OrdersList />;
}
