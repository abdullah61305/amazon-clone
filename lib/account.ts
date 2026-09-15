"use client";

import { useSyncExternalStore } from "react";

export type Account = { email: string; name: string };

const KEY = "amzn-clone:account";
const EVENT = "amzn-clone:account-change";

let cachedRaw: string | null = null;
let cached: Account | null = null;

function parse(raw: string | null): Account | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Account>;
    return typeof v.email === "string" && typeof v.name === "string" ? { email: v.email, name: v.name } : null;
  } catch {
    return null;
  }
}

function read(): Account | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

function subscribe(notify: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) notify();
  };
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, notify);
    window.removeEventListener("storage", onStorage);
  };
}

/** First name-like segment of an email's local part, e.g. "jordan.lee@x.com" → "Jordan". */
export function nameFromEmail(email: string) {
  const first = (email.split("@")[0] ?? "")
    .split(/[._+-]/)
    .map((s) => s.replace(/\d/g, ""))
    .find(Boolean);
  return first ? first[0].toUpperCase() + first.slice(1).toLowerCase() : "there";
}

export function signIn(email: string, name?: string) {
  const trimmed = email.trim();
  const given = name?.trim().split(/\s+/)[0];
  const account: Account = { email: trimmed, name: given || nameFromEmail(trimmed) };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(account));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function signOut() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useAccount() {
  return useSyncExternalStore(subscribe, read, () => null);
}
