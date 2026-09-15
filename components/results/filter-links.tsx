"use client";

import Link, { useLinkStatus } from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Filters are URL-driven server renders. To keep feedback under ~100ms, links update their own
 * state optimistically (checkbox ticks, chip disappears) and the results region dims until the
 * new URL has rendered.
 */
let pendingTimer: ReturnType<typeof setTimeout> | undefined;

export function markPending(e: React.MouseEvent<HTMLAnchorElement>) {
  // Only dim when the click actually navigates somewhere new (not modified clicks or the current URL).
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || e.currentTarget.href === window.location.href) return;
  document.documentElement.dataset.resultsPending = "1";
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => delete document.documentElement.dataset.resultsPending, 5000);
}

export function ResultsRegion({ children }: { children: React.ReactNode }) {
  const search = useSearchParams().toString();
  useEffect(() => {
    delete document.documentElement.dataset.resultsPending;
  }, [search]);
  return (
    <div data-results className="transition-opacity duration-150 ease-(--ease-amzn)">
      {children}
    </div>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-100 ${on ? "border-link bg-link text-white" : "border-[#888c8c] bg-white"}`}
    >
      {on && (
        <svg viewBox="0 0 12 12" className="h-[10px] w-[10px]">
          <path d="M2 6.5l2.5 2.5L10 3" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </span>
  );
}

function CheckState({ on, children }: { on: boolean; children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <Check on={pending ? !on : on} /> {children}
    </>
  );
}

function BoldState({ on, children }: { on: boolean; children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className={(pending ? !on : on) ? "font-bold" : ""}>{children}</span>;
}

type FilterLinkProps = { href: string; on: boolean; kind: "check" | "text"; className?: string; children: React.ReactNode };

export function FilterLink({ href, on, kind, className = "", children }: FilterLinkProps) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={markPending}
      className={className}
      role={kind === "check" ? "checkbox" : undefined}
      aria-checked={kind === "check" ? on : undefined}
      aria-current={kind === "text" && on ? "true" : undefined}
    >
      {kind === "check" ? <CheckState on={on}>{children}</CheckState> : <BoldState on={on}>{children}</BoldState>}
    </Link>
  );
}

function ChipBody({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <span className={`inline-flex items-center gap-1 transition-opacity duration-100 ${pending ? "opacity-40 line-through" : ""}`}>
      {label}
      <X size={14} />
    </span>
  );
}

export function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={markPending}
      aria-label={`Remove filter ${label}`}
      className="inline-flex min-h-[32px] shrink-0 animate-fade-in items-center whitespace-nowrap rounded-full border border-[#8d9096] bg-[#f0f2f2] py-[4px] pl-3 pr-2 text-[13px] transition-colors duration-150 hover:bg-[#e3e6e6]"
    >
      <ChipBody label={label} />
    </Link>
  );
}

/** Plain navigation link inside results (pagination, clear all) that dims results while loading. */
export function ResultsLink(props: React.ComponentProps<typeof Link>) {
  return <Link {...props} onClick={markPending} />;
}
