import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmation } from "@/components/checkout/confirmation";

export const metadata: Metadata = { title: "Thank you" };

export default function ThankYouPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
