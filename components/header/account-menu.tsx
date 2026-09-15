"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { signOut, useAccount } from "@/lib/account";
import { SignInDialog } from "./sign-in-dialog";

/** "Hello, sign in / Account & Lists" with Amazon's hover flyout (click/tap to toggle on touch). */
export function AccountMenu() {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const show = () => {
    if (dialog) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 120);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  const openDialog = () => {
    clearTimeout(timer.current);
    setOpen(false);
    setDialog(true);
  };
  const closeDialog = () => {
    setDialog(false);
    trigger.current?.focus();
  };

  const onTrigger = () => {
    if (!account && window.matchMedia("(max-width: 639.98px)").matches) {
      openDialog();
      return;
    }
    setOpen((o) => !o);
  };

  const close = () => setOpen(false);
  const linkClass = "hover:text-link-hover hover:underline";

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onTrigger}
        className="flex items-center gap-1 rounded-sm border border-transparent px-[9px] py-[6px] text-left hover:border-white"
      >
        <span className="flex items-center gap-1 text-[14px] sm:hidden">
          <span className="max-w-[96px] truncate">{account ? account.name : "Sign in"}</span> ›<User size={24} />
        </span>
        <span className="hidden flex-col leading-[15px] sm:flex">
          <span className="max-w-[160px] truncate text-[12px]">Hello, {account ? account.name : "sign in"}</span>
          <span className="flex items-center text-[14px] font-bold">
            Account & Lists <ChevronDown size={12} className="ml-[2px] text-[#a7acb2]" />
          </span>
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 top-[99px] z-[-1] hidden bg-black/40 sm:block" aria-hidden />
          <div className="absolute right-[-60px] top-full z-50 mt-[6px] w-[min(92vw,470px)] animate-fade-in rounded-sm bg-white p-5 text-ink shadow-[0_2px_8px_rgba(0,0,0,.3)] sm:right-[-80px]">
            {account ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#f0f8ff] px-4 py-3 text-[13px]">
                <span className="min-w-0 truncate">
                  Signed in as <span className="font-bold">{account.email}</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center border-b border-[#e7e7e7] pb-4">
                <button type="button" onClick={openDialog} className="btn-yellow w-[220px] rounded-lg">
                  Sign in
                </button>
                <p className="mt-2 text-[11px]">
                  New customer?{" "}
                  <button type="button" onClick={openDialog} className="link">
                    Start here.
                  </button>
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-6 pt-4 text-[13px]">
              <div>
                <h3 className="mb-2 text-[16px] font-bold">Your Lists</h3>
                <ul className="space-y-[6px]">
                  <li><Link href="/cart#saved" className={linkClass} onClick={close}>Saved for Later</Link></li>
                  <li><Link href="/s?sort=bestsellers" className={linkClass} onClick={close}>Best Sellers</Link></li>
                </ul>
              </div>
              <div className="border-l border-[#e7e7e7] pl-6">
                <h3 className="mb-2 text-[16px] font-bold">Your Account</h3>
                <ul className="space-y-[6px]">
                  <li><Link href="/orders" className={linkClass} onClick={close}>Orders</Link></li>
                  <li><Link href="/cart" className={linkClass} onClick={close}>Shopping Cart</Link></li>
                  <li><Link href="/s?deals=1" className={linkClass} onClick={close}>Today&apos;s Deals</Link></li>
                  {account && (
                    <li>
                      <button
                        type="button"
                        className={linkClass}
                        onClick={() => {
                          signOut();
                          close();
                          trigger.current?.focus();
                        }}
                      >
                        Sign Out
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
      {dialog && <SignInDialog onClose={closeDialog} />}
    </div>
  );
}
