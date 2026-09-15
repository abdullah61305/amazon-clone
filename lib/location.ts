"use client";

import { useSyncExternalStore } from "react";

export const DEFAULT_ZIP = "10001";
const KEY = "amzn-clone:zip";
const EVENT = "amzn-clone:zip-change";

export const isValidZip = (zip: string) => /^\d{5}$/.test(zip);

function read(): string {
  try {
    const v = window.localStorage.getItem(KEY);
    return v && isValidZip(v) ? v : DEFAULT_ZIP;
  } catch {
    return DEFAULT_ZIP;
  }
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

export function setDeliveryZip(zip: string) {
  if (!isValidZip(zip)) return;
  try {
    window.localStorage.setItem(KEY, zip);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useDeliveryZip() {
  const zip = useSyncExternalStore(subscribe, read, () => DEFAULT_ZIP);
  return { zip, label: zipLabel(zip), offset: zipDeliveryOffset(zip), setZip: setDeliveryZip };
}

const cities: [from: number, to: number, city: string][] = [
  [21, 21, "Boston"],
  [100, 104, "New York"],
  [331, 331, "Miami"],
  [606, 606, "Chicago"],
  [787, 787, "Austin"],
  [900, 918, "Los Angeles"],
  [941, 941, "San Francisco"],
  [981, 981, "Seattle"],
];

export function zipLabel(zip: string) {
  const prefix = Number(zip.slice(0, 3));
  const hit = cities.find(([from, to]) => prefix >= from && prefix <= to);
  return hit ? `${hit[2]} ${zip}` : zip;
}

export function zipDeliveryOffset(zip: string): 0 | 1 {
  return /^[0-2]/.test(zip) ? 0 : 1;
}
