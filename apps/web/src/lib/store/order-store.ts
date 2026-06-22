import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  normalizeOrder,
  ordersSeed,
  type Order,
  type OrderComment,
  type OrderStatus,
  type TimelineEvent,
} from "@/lib/mock-data/orders";

type OrderStore = {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  patchOrder: (id: string, patch: Partial<Order>) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  addTimelineEntry: (id: string, entry: TimelineEvent) => void;
  addComment: (id: string, comment: OrderComment) => void;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, order: Order) => void;
  setOrders: (orders: Order[]) => void;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: ordersSeed.map(normalizeOrder),
      getOrderById: (id) => get().orders.find((o) => o.id === id),
      patchOrder: (id, patch) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      createOrder: (order) =>
        set((s) => ({ orders: [normalizeOrder(order), ...s.orders] })),
      updateOrder: (id, order) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? normalizeOrder(order) : o)),
        })),
      updateStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  timeline: [
                    {
                      id: `t_${Date.now()}`,
                      type: "status",
                      title: `Status changed to ${status}`,
                      actor: "You",
                      actorInitials: "YO",
                      at: new Date().toISOString(),
                    },
                    ...o.timeline,
                  ],
                }
              : o,
          ),
        })),
      addTimelineEntry: (id, entry) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, timeline: [entry, ...o.timeline] } : o,
          ),
        })),
      addComment: (id, comment) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, comments: [comment, ...o.comments] } : o,
          ),
        })),
      setOrders: (orders) => set({ orders }),
    }),
    {
      name: "again-orders-v2",
      merge: (persisted, current) => {
        const state = persisted as Partial<OrderStore> | undefined;
        return {
          ...current,
          orders: Array.isArray(state?.orders)
            ? state.orders.map(normalizeOrder)
            : current.orders,
        };
      },
    },
  ),
);
