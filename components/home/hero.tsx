"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = { eyebrow: string; title: string; cta: string; href: string; from: string; to: string; images: string[] };

/** Full-bleed hero that fades into the page ground, with Amazon's large edge arrows and autoplay. */
export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((d: number) => setI((n) => (n + d + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [paused, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[300px] overflow-hidden sm:h-[420px] lg:h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, n) => (
        <div
          key={s.title}
          aria-hidden={n !== i}
          className={`absolute inset-0 transition-opacity duration-700 ${n === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{ background: `linear-gradient(120deg, ${s.from}, ${s.to})` }}
        >
          <div className="mx-auto flex h-full max-w-[1500px] items-start justify-between gap-4 px-6 pt-6 sm:px-16 sm:pt-12 lg:px-24">
            <div className="max-w-[46%] text-white sm:max-w-[40%]">
              <p className="text-[12px] font-bold uppercase tracking-wide opacity-90 sm:text-[16px]">{s.eyebrow}</p>
              <h2 className="mt-1 text-[22px] font-bold leading-[1.05] sm:mt-2 sm:text-[44px] lg:text-[54px]">{s.title}</h2>
              <Link href={s.href} tabIndex={n === i ? 0 : -1} className="btn-yellow mt-3 px-5 text-[13px] sm:mt-6 sm:py-2 sm:text-[15px]">
                {s.cta}
              </Link>
            </div>
            <div className="relative grid h-[150px] flex-1 grid-cols-3 items-start gap-2 sm:h-[240px] sm:gap-4 lg:h-[300px]">
              {s.images.slice(0, 3).map((src, k) => (
                <div key={src} className={`relative h-full rounded-xl bg-white/85 shadow-lg ${k === 1 ? "mt-6 sm:mt-10" : ""}`}>
                  <Image src={src} alt="" fill sizes="(max-width: 640px) 18vw, 220px" className="object-contain p-2 sm:p-4" priority={n === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {/* Fade to page ground so the card grid can overlap the hero, as on amazon.com */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent to-page" />
      <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className="absolute left-0 top-0 hidden h-[250px] w-[80px] items-center justify-center text-ink/80 hover:text-ink focus-visible:outline-white sm:flex lg:h-[270px]">
        <ChevronLeft size={48} strokeWidth={1.2} className="text-white drop-shadow" />
      </button>
      <button type="button" aria-label="Next slide" onClick={() => go(1)} className="absolute right-0 top-0 hidden h-[250px] w-[80px] items-center justify-center hover:text-ink sm:flex lg:h-[270px]">
        <ChevronRight size={48} strokeWidth={1.2} className="text-white drop-shadow" />
      </button>
      <div className="absolute bottom-[48%] left-1/2 flex -translate-x-1/2 gap-2 sm:hidden">
        {slides.map((s, n) => (
          <button key={s.title} type="button" aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} className={`h-2 w-2 rounded-full ${n === i ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
    </section>
  );
}
