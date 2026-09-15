"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductImage } from "@/components/ui";

/** Amazon gallery: hovering a thumbnail swaps the main image; click opens a full view. Swipeable on phones. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [full, setFull] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full, images.length]);

  return (
    <div className="md:sticky md:top-[110px] md:self-start">
      {/* Phone: swipe strip with dots */}
      <div className="md:hidden">
        <div
          ref={stripRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <button key={src} type="button" className="w-full shrink-0 snap-center" onClick={() => { setActive(i); setFull(true); }} aria-label={`Open image ${i + 1} of ${images.length}`}>
              <ProductImage src={src} alt={i === 0 ? title : ""} sizes="100vw" priority={i === 0} className="aspect-square" ground={false} />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex justify-center gap-2" aria-hidden>
            {images.map((src, i) => (
              <span key={src} className={`h-2 w-2 rounded-full border border-[#8d9096] ${i === active ? "bg-ink" : "bg-white"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: vertical thumbnails + main image */}
      <div className="hidden gap-3 md:flex">
        <ul className="flex shrink-0 flex-col gap-2">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`relative block h-[48px] w-[40px] overflow-hidden rounded-lg border bg-white ${i === active ? "border-link shadow-[0_0_3px_2px_rgba(0,113,133,.5)]" : "border-[#888c8c]"}`}
              >
                <Image src={src} alt="" fill sizes="40px" className="object-contain p-[2px]" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex-1">
          <button type="button" className="block w-full cursor-zoom-in" onClick={() => setFull(true)} aria-label="Click to see full view">
            <ProductImage key={images[active]} src={images[active]} alt={title} sizes="(max-width: 1024px) 45vw, 40vw" priority className="aspect-square" ground={false} />
          </button>
          <p className="mt-2 text-center text-[12px] text-link">Click to see full view</p>
        </div>
      </div>

      {full && (
        <div className="fixed inset-0 z-[100] flex animate-fade-in flex-col bg-white" role="dialog" aria-modal="true" aria-label={`${title} images`}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="truncate pr-4 text-[14px]">{title}</p>
            <button type="button" autoFocus onClick={() => setFull(false)} aria-label="Close full view" className="rounded-full p-2 hover:bg-[#f0f2f2]">
              <X size={24} />
            </button>
          </div>
          <div className="relative flex-1">
            <Image key={images[active]} src={images[active]} alt={title} fill sizes="100vw" className="animate-fade-in object-contain p-6" />
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Previous image" onClick={() => setActive((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white p-2 shadow hover:bg-[#f7fafa]">
                  <ChevronLeft size={28} />
                </button>
                <button type="button" aria-label="Next image" onClick={() => setActive((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-line bg-white p-2 shadow hover:bg-[#f7fafa]">
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
          <div className="flex justify-center gap-2 border-t border-line p-3">
            {images.map((src, i) => (
              <button key={src} type="button" onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} className={`relative h-14 w-14 rounded-md border ${i === active ? "border-link shadow-[0_0_3px_2px_rgba(0,113,133,.5)]" : "border-line"}`}>
                <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
