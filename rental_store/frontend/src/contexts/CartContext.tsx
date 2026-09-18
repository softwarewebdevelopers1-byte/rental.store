import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../types/marketplace";

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (kind: CartItem["kind"], refId: string) => void;
  updateQty: (kind: CartItem["kind"], refId: string, qty: number) => void;
  clear: () => void;
  count: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.kind === item.kind && i.refId === item.refId,
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const remove = useCallback(
    (kind: CartItem["kind"], refId: string) =>
      setItems((prev) =>
        prev.filter((i) => !(i.kind === kind && i.refId === refId)),
      ),
    [],
  );

  const updateQty = useCallback(
    (kind: CartItem["kind"], refId: string, qty: number) =>
      setItems((prev) =>
        prev.map((i) =>
          i.kind === kind && i.refId === refId
            ? { ...i, quantity: Math.max(1, qty) }
            : i,
        ),
      ),
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, add, remove, updateQty, clear, count: items.length }),
    [items, add, remove, updateQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
