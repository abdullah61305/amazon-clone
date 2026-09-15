import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";

export const metadata: Metadata = {
  title: { default: "Amazon Clone — Spend less. Smile more.", template: "%s · Amazon Clone" },
  description: "A reverse-engineered rebuild of the Amazon.com shopping journey: search, results, product pages, cart and checkout.",
};

export const viewport: Viewport = { themeColor: "#131921" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <a href="#main" className="sr-only z-[200] bg-white p-2 focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
          Skip to main content
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
