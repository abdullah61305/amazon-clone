"use client";

import Link from "next/link";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white px-4 py-20 text-center" role="alert">
      <h1 className="text-[24px] font-bold">Something went wrong on our end</h1>
      <p className="max-w-[420px] text-[14px] text-muted">Your cart is safe. Please try again, or go back to the homepage.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn-yellow px-6 py-2">
          Try again
        </button>
        <Link href="/" className="btn-white px-6 py-2">
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
