"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal product shelf with Amazon's side paddles; native scroll/swipe on touch. */
export function Shelf({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const page = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth - 80), behavior: "smooth" });
  const paddle =
    "absolute top-[35%] z-10 hidden h-[100px] w-[45px] -translate-y-1/2 items-center justify-center rounded-sm border border-[#d5d9d9] bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,.2)] hover:bg-white md:flex";

  return (
    <div className="relative" role="region" aria-label={label}>
      {!edges.start && (
        <button type="button" aria-label="Previous" className={`${paddle} left-0`} onClick={() => page(-1)}>
          <ChevronLeft size={28} />
        </button>
      )}
      <div ref={ref} className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth pb-1">
        {children}
      </div>
      {!edges.end && (
        <button type="button" aria-label="Next" className={`${paddle} right-0`} onClick={() => page(1)}>
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
