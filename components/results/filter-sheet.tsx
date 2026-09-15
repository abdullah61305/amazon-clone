"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/** Mobile filter panel: a bottom sheet holding the same server-rendered filter links as the desktop sidebar. */
export function FilterSheet({ children, count }: { children: React.ReactNode; count: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [route, setRoute] = useState(pathname + search);

  // Close once a filter link has navigated.
  if (route !== pathname + search) {
    setRoute(pathname + search);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#8d9096] bg-white px-4 py-[5px] text-[13px] font-bold"
      >
        <SlidersHorizontal size={16} /> Filters{count > 0 && <span className="rounded-full bg-link px-[6px] text-[11px] text-white">{count}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-rise flex-col rounded-t-2xl bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-[18px] font-bold">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="rounded-full p-1 hover:bg-[#f0f2f2]">
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">{children}</div>
            <div className="border-t border-line p-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-yellow w-full py-2">
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
