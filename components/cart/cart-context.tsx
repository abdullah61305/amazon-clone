"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartLine = {
  key: string; // `${productId}:${variant}`
  productId: number;
  slug: string;
  title: string;
  image: string;
  price: number;
  listPrice: number | null;
  variant: string | null; // e.g. "Size: M"
  stock: number;
  qty: number;
};

export type Order = {
  id: string;
  placedAt: string;
  lines: CartLine[];
  address: { name: string; street: string; city: string; state: string; zip: string };
  delivery: { label: string; days: number; price: number };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

type Notice = { title: string; text: string; undo: () => void } | null;
type Added = { line: CartLine; qty: number } | null;

type CartState = { lines: CartLine[]; saved: CartLine[]; orders: Order[] };

type CartApi = CartState & {
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  placeOrder: (order: Omit<Order, "id" | "placedAt" | "lines">) => Order;
  notice: Notice;
  dismissNotice: () => void;
  added: Added;
  dismissAdded: () => void;
};

const STORAGE_KEY = "amzn-clone:v1";
export const MAX_QTY = 10;

const CartContext = createContext<CartApi | null>(null);

const empty: CartState = { lines: [], saved: [], orders: [] };

function load(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return { lines: parsed.lines ?? [], saved: parsed.saved ?? [], orders: parsed.orders ?? [] };
  } catch {
    return empty;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(empty);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [added, setAdded] = useState<Added>(null);
  const skipWrite = useRef(true);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hydrate from storage after mount (server render has no cart), and follow other tabs.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setState(load());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        skipWrite.current = true;
        setState(load());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: cart still works for this tab
    }
  }, [state]);

  // Undo restores the whole cart snapshot taken just before the change.
  const snapshotUndo = useCallback((key: string, list: "lines" | "saved", text: string) => {
    const prev = stateRef.current;
    const title = prev[list].find((l) => l.key === key)?.title ?? "Item";
    setNotice({ title, text, undo: () => { setState(prev); setNotice(null); } });
  }, []);

  const add = useCallback<CartApi["add"]>((line, qty = 1) => {
    const key = `${line.productId}:${line.variant ?? ""}`;
    const limit = Math.min(MAX_QTY, line.stock);
    const existing = stateRef.current.lines.find((l) => l.key === key);
    const nextQty = Math.min(limit, (existing?.qty ?? 0) + qty);
    setAdded({ line: { ...line, key, qty: nextQty }, qty });
    setState((s) => {
      const lines = s.lines.some((l) => l.key === key)
        ? s.lines.map((l) => (l.key === key ? { ...l, ...line, qty: Math.min(limit, l.qty + qty) } : l))
        : [{ ...line, key, qty: Math.min(limit, qty) }, ...s.lines];
      return { ...s, lines, saved: s.saved.filter((l) => l.key !== key) };
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setState((s) => ({ ...s, lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, MAX_QTY, l.stock)) } : l)) }));
  }, []);

  const remove = useCallback((key: string) => {
    snapshotUndo(key, "lines", "was removed from Shopping Cart.");
    setState((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) }));
  }, [snapshotUndo]);

  const saveForLater = useCallback((key: string) => {
    snapshotUndo(key, "lines", "has been moved to Saved for Later.");
    setState((s) => {
      const line = s.lines.find((l) => l.key === key);
      if (!line) return s;
      return { ...s, lines: s.lines.filter((l) => l.key !== key), saved: [line, ...s.saved.filter((l) => l.key !== key)] };
    });
  }, [snapshotUndo]);

  const moveToCart = useCallback((key: string) => {
    setNotice(null);
    setState((s) => {
      const line = s.saved.find((l) => l.key === key);
      if (!line) return s;
      return { ...s, saved: s.saved.filter((l) => l.key !== key), lines: [line, ...s.lines.filter((l) => l.key !== key)] };
    });
  }, []);

  const removeSaved = useCallback((key: string) => {
    snapshotUndo(key, "saved", "was removed from Saved for Later.");
    setState((s) => ({ ...s, saved: s.saved.filter((l) => l.key !== key) }));
  }, [snapshotUndo]);

  const placeOrder = useCallback<CartApi["placeOrder"]>((details) => {
    const order: Order = {
      ...details,
      id: `112-${Math.floor(1e6 + Math.random() * 9e6)}-${Math.floor(1e6 + Math.random() * 9e6)}`,
      placedAt: new Date().toISOString(),
      lines: state.lines,
    };
    setNotice(null);
    setState((s) => ({ ...s, lines: [], orders: [order, ...s.orders] }));
    return order;
  }, [state.lines]);

  // The notice line in the cart is the undo affordance; clear it after a while.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(t);
  }, [notice]);

  const value = useMemo<CartApi>(
    () => ({
      ...state,
      ready,
      count: state.lines.reduce((n, l) => n + l.qty, 0),
      subtotal: Math.round(state.lines.reduce((n, l) => n + l.qty * l.price, 0) * 100) / 100,
      add,
      setQty,
      remove,
      saveForLater,
      moveToCart,
      removeSaved,
      placeOrder,
      notice,
      dismissNotice: () => setNotice(null),
      added,
      dismissAdded: () => setAdded(null),
    }),
    [state, ready, add, setQty, remove, saveForLater, moveToCart, removeSaved, placeOrder, notice, added],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
