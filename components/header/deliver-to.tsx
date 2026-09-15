"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MapPin, X } from "lucide-react";
import { isValidZip, setDeliveryZip, useDeliveryZip, zipLabel } from "@/lib/location";

export function DeliverTo({ variant = "belt", className = "" }: { variant?: "belt" | "strip"; className?: string }) {
  const { zip, label } = useDeliveryZip();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const titleId = useId();
  const descId = useId();
  const errorId = useId();

  const show = () => {
    clearTimeout(closeTimer.current);
    setDraft(zip);
    setError(false);
    setSaved(null);
    setOpen(true);
  };

  const close = () => {
    clearTimeout(closeTimer.current);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const apply = () => {
    if (!isValidZip(draft)) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setDeliveryZip(draft);
    setError(false);
    setSaved(zipLabel(draft));
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(close, 900);
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = dialogRef.current.querySelectorAll<HTMLElement>("button, input");
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const trigger =
    variant === "strip" ? (
      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className={`flex w-full items-center gap-1 bg-nav-3 px-3 py-[9px] text-left text-[13px] text-white ${className}`}
      >
        <MapPin size={16} className="shrink-0" />
        <span className="truncate">
          Deliver to <b>{label}</b>
        </span>
        <ChevronDown size={14} className="shrink-0" />
      </button>
    ) : (
      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-label={`Delivering to ${label}. Update location`}
        className={className}
      >
        <MapPin size={16} className="mb-[2px]" />
        <span className="flex flex-col leading-[15px]">
          <span className="text-[12px] text-[#ccc]">Deliver to</span>
          <span className="text-[14px] font-bold">{label}</span>
        </span>
      </button>
    );

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onKeyDown={onKeyDown}>
            <div className="absolute inset-0 animate-fade-in bg-black/60" onClick={close} aria-hidden />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="relative w-full max-w-[375px] animate-rise overflow-hidden rounded-lg bg-white text-ink shadow-[0_4px_20px_rgba(0,0,0,.35)]"
            >
              <div className="flex items-center justify-between border-b border-line bg-[#f0f2f2] px-5 py-3">
                <h2 id={titleId} className="text-[16px] font-bold">
                  Choose your location
                </h2>
                <button type="button" onClick={close} aria-label="Close" className="rounded p-1 text-muted hover:text-ink">
                  <X size={18} />
                </button>
              </div>
              <form
                className="px-5 py-4"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  apply();
                }}
              >
                <p id={descId} className="text-[12px] leading-[16px] text-muted">
                  Delivery options and delivery speeds may vary for different locations
                </p>
                <label htmlFor={`${titleId}-zip`} className="mt-3 block text-[13px] font-bold">
                  Enter a US ZIP code
                </label>
                <div className="mt-1 flex items-start gap-2">
                  <input
                    ref={inputRef}
                    id={`${titleId}-zip`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value.replace(/\D/g, "").slice(0, 5));
                      setError(false);
                      setSaved(null);
                    }}
                    aria-invalid={error}
                    aria-describedby={error ? errorId : undefined}
                    className={`field flex-1 ${error ? "border-deal focus:border-deal" : ""}`}
                  />
                  <button type="submit" className="btn-white shrink-0 py-[7px]">
                    Apply
                  </button>
                </div>
                {error && (
                  <p id={errorId} role="alert" className="mt-1 text-[12px] text-deal">
                    Please enter a valid US ZIP code (5 digits).
                  </p>
                )}
                {saved && (
                  <p role="status" className="mt-2 animate-fade-in text-[13px] text-stock">
                    Delivering to <b>{saved}</b>
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={close} className="btn-yellow px-6">
                    Done
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
