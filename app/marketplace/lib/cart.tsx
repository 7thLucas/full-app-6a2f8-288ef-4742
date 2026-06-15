import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./types";

export interface CartLine {
  productId: string;
  shopId: string;
  shopName: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  shopId: string | null;
  shopName: string | null;
  count: number;
  subtotal: number;
  add: (product: Product, shopName: string) => { ok: boolean; conflict?: boolean };
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "tester_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const shopId = lines[0]?.shopId ?? null;
  const shopName = lines[0]?.shopName ?? null;

  function add(product: Product, name: string): { ok: boolean; conflict?: boolean } {
    // Single-shop cart (typical food-delivery constraint).
    if (lines.length > 0 && lines[0].shopId !== product.shopId) {
      return { ok: false, conflict: true };
    }
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          shopId: product.shopId,
          shopName: name,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    });
    return { ok: true };
  }

  function setQty(productId: string, qty: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.max(0, qty) } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function clear() {
    setLines([]);
  }

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return { lines, shopId, shopName, count, subtotal, add, setQty, remove, clear };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, shopId, shopName]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
