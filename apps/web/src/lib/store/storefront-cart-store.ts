"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLineItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  qty: number;
  variantLabel?: string;
};

type CartState = {
  items: CartLineItem[];
  couponCode: string | null;
  couponDiscount: number;
  count: number;
  addItem: (item: Omit<CartLineItem, "id"> & { id?: string }) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  setCoupon: (code: string | null, discount?: number) => void;
  clearCart: () => void;
  setItems: (items: CartLineItem[]) => void;
  increment: () => void;
};

function syncCount(items: CartLineItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

const seedItems: CartLineItem[] = [
  {
    id: "line_1",
    productId: "prod_0001",
    slug: "sku-0001",
    name: "Premium Cotton T-Shirt",
    image: "https://picsum.photos/seed/prod_0001/600/600",
    price: 299,
    compareAtPrice: 499,
    qty: 2,
    variantLabel: "Black / M",
  },
  {
    id: "line_2",
    productId: "prod_0002",
    slug: "sku-0002",
    name: "Wireless Earbuds Pro",
    image: "https://picsum.photos/seed/prod_0002/600/600",
    price: 346,
    qty: 1,
    variantLabel: "Black / 128GB",
  },
];

export const useStorefrontCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: seedItems,
      couponCode: null,
      couponDiscount: 0,
      count: syncCount(seedItems),
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find(
            (i) => i.productId === item.productId && i.variantLabel === item.variantLabel,
          );
          let items: CartLineItem[];
          if (existing) {
            items = s.items.map((i) =>
              i.id === existing.id ? { ...i, qty: i.qty + (item.qty || 1) } : i,
            );
          } else {
            items = [...s.items, { ...item, id: item.id ?? `line_${Date.now()}` }];
          }
          return { items, count: syncCount(items) };
        }),
      updateQty: (id, qty) =>
        set((s) => {
          const items =
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty } : i));
          return { items, count: syncCount(items) };
        }),
      removeItem: (id) =>
        set((s) => {
          const items = s.items.filter((i) => i.id !== id);
          return { items, count: syncCount(items) };
        }),
      setCoupon: (code, discount = 0) => set({ couponCode: code, couponDiscount: discount }),
      clearCart: () => set({ items: [], count: 0, couponCode: null, couponDiscount: 0 }),
      setItems: (items) => set({ items, count: syncCount(items) }),
      increment: () => {
        const first = get().items[0];
        if (first) get().updateQty(first.id, first.qty + 1);
        else get().addItem({ ...seedItems[0], qty: 1 });
      },
    }),
    {
      name: "storefront-cart",
      partialize: (s) => ({
        items: s.items,
        couponCode: s.couponCode,
        couponDiscount: s.couponDiscount,
        count: s.count,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.items.length === 0) {
          state.items = seedItems;
          state.count = syncCount(seedItems);
        }
      },
    },
  ),
);

export function getCartSubtotal(items: CartLineItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getCartSavings(items: CartLineItem[]) {
  return items.reduce((sum, i) => {
    if (i.compareAtPrice && i.compareAtPrice > i.price) {
      return sum + (i.compareAtPrice - i.price) * i.qty;
    }
    return sum;
  }, 0);
}
