"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff, Star, StarHalf } from "lucide-react";
import { splitPrice, compactCount } from "@/lib/format";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex flex-col leading-none text-white ${className}`} aria-label="amazon clone home">
      <span className="text-[26px] font-bold tracking-[-1px]" style={{ fontFamily: "Arial Black, Arial, sans-serif" }}>
        amazon
      </span>
      <svg viewBox="0 0 100 18" className="-mt-[5px] ml-[4px] h-[10px] w-[78%]" aria-hidden>
        <path d="M2 4 Q48 22 90 6" fill="none" stroke="#ff9900" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M82 1 L94 5 L86 14" fill="none" stroke="#ff9900" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

type PriceSize = "sm" | "md" | "lg";
const priceSizes: Record<PriceSize, { sym: string; whole: string }> = {
  sm: { sym: "text-[11px] top-[-0.45em]", whole: "text-[21px]" },
  md: { sym: "text-[13px] top-[-0.55em]", whole: "text-[28px]" },
  lg: { sym: "text-[14px] top-[-0.75em]", whole: "text-[28px] sm:text-[32px]" },
};

/** Amazon's price treatment: superscript "$", large whole part, superscript cents. */
export function Price({ value, size = "sm", className = "" }: { value: number; size?: PriceSize; className?: string }) {
  const { whole, cents } = splitPrice(value);
  const s = priceSizes[size];
  return (
    <span className={`inline-flex items-start leading-none text-ink ${className}`} aria-label={`$${whole}.${cents}`}>
      <span className={`relative ${s.sym}`} aria-hidden>$</span>
      <span className={`${s.whole} font-normal`} aria-hidden>{whole}</span>
      <span className={`relative ${s.sym}`} aria-hidden>{cents}</span>
    </span>
  );
}

export function Stars({ rating, count, size = 16, href }: { rating: number; count?: number; size?: number; href?: string }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3 && rating - full < 0.8;
  const roundedUp = rating - full >= 0.8;
  const icons = Array.from({ length: 5 }, (_, i) => {
    if (i < full || (roundedUp && i === full)) return <Star key={i} size={size} className="fill-star text-star" strokeWidth={1.2} />;
    if (half && i === full)
      return (
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="absolute text-star" strokeWidth={1.2} />
          <StarHalf size={size} className="absolute fill-star text-star" strokeWidth={1.2} />
        </span>
      );
    return <Star key={i} size={size} className="text-star" strokeWidth={1.2} />;
  });
  return (
    <span className="inline-flex items-center gap-1 text-[14px]">
      <span className="text-ink">{rating.toFixed(1)}</span>
      <span className="inline-flex" role="img" aria-label={`${rating} out of 5 stars`}>
        {icons}
      </span>
      {count !== undefined &&
        (href ? (
          <a href={href} className="link">
            ({compactCount(count)})
          </a>
        ) : (
          <span className="text-link">({compactCount(count)})</span>
        ))}
    </span>
  );
}

/** Product image on a soft ground with a shimmer until it loads and a graceful fallback if the CDN fails. */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className = "",
  ground = true,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  ground?: boolean;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  return (
    <div className={`relative overflow-hidden ${ground ? "bg-[#f7f7f7]" : ""} ${className}`}>
      {state === "loading" && <div className="skeleton absolute inset-0 rounded-none" />}
      {state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted">
          <ImageOff size={28} strokeWidth={1.4} />
          <span className="text-[12px]">Image unavailable</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-contain mix-blend-multiply transition-opacity duration-300 ${state === "loaded" ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}
    </div>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  const dark = typeof children === "string" && children.includes("Choice");
  return (
    <span
      className={`inline-block rounded-[3px] px-[6px] py-[2px] text-[12px] leading-[16px] text-white ${dark ? "bg-nav-2" : "bg-badge"}`}
    >
      {dark ? (
        <>
          Amazon&apos;s <span className="text-[#ff9900]">Choice</span>
        </>
      ) : (
        children
      )}
    </span>
  );
}

export function PrimeCheck({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center text-[13px] font-bold italic leading-none ${className}`} aria-label="Prime">
      <span className="mr-[1px] text-[#ff9900]">✓</span>
      <span className="text-[#1399ff]">prime</span>
    </span>
  );
}
