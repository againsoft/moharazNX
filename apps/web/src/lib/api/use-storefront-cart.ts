"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addStorefrontCartItem,
  apiCartToLineItems,
  fetchStorefrontCart,
  removeStorefrontCartItem,
  updateStorefrontCartItem,
} from "@/lib/api/storefront-cart";
import { useStorefrontCart, type CartLineItem } from "@/lib/store/storefront-cart-store";

type UseStorefrontCartApiState = {
  items: CartLineItem[];
  loading: boolean;
  error: string | null;
  apiEnabled: boolean;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
};

export function useStorefrontCartApi(): UseStorefrontCartApiState {
  const items = useStorefrontCart((s) => s.items);
  const setItems = useStorefrontCart((s) => s.setItems);
  const localUpdateQty = useStorefrontCart((s) => s.updateQty);
  const localRemoveItem = useStorefrontCart((s) => s.removeItem);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiEnabled, setApiEnabled] = useState(false);

  const syncCart = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const cart = await fetchStorefrontCart();
        setItems(apiCartToLineItems(cart));
        setApiEnabled(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load cart";
        setError(message);
        setApiEnabled(false);
      } finally {
        setLoading(false);
      }
    },
    [setItems],
  );

  useEffect(() => {
    void syncCart();
  }, [syncCart]);

  const updateQty = useCallback(
    async (id: string, qty: number) => {
      if (!apiEnabled) {
        localUpdateQty(id, qty);
        return;
      }
      try {
        const cart = await updateStorefrontCartItem(id, qty);
        setItems(apiCartToLineItems(cart));
      } catch (err) {
        localUpdateQty(id, qty);
        setError(err instanceof Error ? err.message : "Failed to update cart");
      }
    },
    [apiEnabled, localUpdateQty, setItems],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!apiEnabled) {
        localRemoveItem(id);
        return;
      }
      try {
        const cart = await removeStorefrontCartItem(id);
        setItems(apiCartToLineItems(cart));
      } catch (err) {
        localRemoveItem(id);
        setError(err instanceof Error ? err.message : "Failed to remove item");
      }
    },
    [apiEnabled, localRemoveItem, setItems],
  );

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!apiEnabled) {
        throw new Error("Cart API not available");
      }
      try {
        const cart = await addStorefrontCartItem(productId, quantity);
        setItems(apiCartToLineItems(cart));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
        throw err;
      }
    },
    [apiEnabled, setItems],
  );

  return { items, loading, error, apiEnabled, updateQty, removeItem, addItem };
}
