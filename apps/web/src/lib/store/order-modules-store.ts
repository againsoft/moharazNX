import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AbandonedCart,
  type OrderActivity,
  type OrderPayment,
  type OrderRefund,
  type OrderReturn,
  type OrderShipment,
  type PaymentTxnStatus,
  type RecoveryStatus,
  type RefundStatus,
  type ReturnStatus,
  type ShipmentStatus,
  type OrderActivityStatus,
  abandonedCartsSeed,
  orderActivitiesSeed,
  paymentsSeed,
  refundsSeed,
  returnsSeed,
  shipmentsSeed,
} from "@/lib/mock-data/order-modules";

type OrderModulesStore = {
  returns: OrderReturn[];
  refunds: OrderRefund[];
  payments: OrderPayment[];
  shipments: OrderShipment[];
  abandonedCarts: AbandonedCart[];
  activities: OrderActivity[];

  updateReturnStatus: (id: string, status: ReturnStatus) => void;
  updateRefundStatus: (id: string, status: RefundStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentTxnStatus) => void;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => void;
  updateRecoveryStatus: (id: string, status: RecoveryStatus) => void;
  updateActivityStatus: (id: string, status: OrderActivityStatus) => void;
};

export const useOrderModulesStore = create<OrderModulesStore>()(
  persist(
    (set) => ({
      returns: returnsSeed,
      refunds: refundsSeed,
      payments: paymentsSeed,
      shipments: shipmentsSeed,
      abandonedCarts: abandonedCartsSeed,
      activities: orderActivitiesSeed,

      updateReturnStatus: (id, status) =>
        set((s) => ({ returns: s.returns.map((r) => (r.id === id ? { ...r, status } : r)) })),

      updateRefundStatus: (id, status) =>
        set((s) => ({ refunds: s.refunds.map((r) => (r.id === id ? { ...r, status } : r)) })),

      updatePaymentStatus: (id, status) =>
        set((s) => ({ payments: s.payments.map((p) => (p.id === id ? { ...p, status } : p)) })),

      updateShipmentStatus: (id, status) =>
        set((s) => ({ shipments: s.shipments.map((sh) => (sh.id === id ? { ...sh, status } : sh)) })),

      updateRecoveryStatus: (id, status) =>
        set((s) => ({ abandonedCarts: s.abandonedCarts.map((c) => (c.id === id ? { ...c, recoveryStatus: status } : c)) })),

      updateActivityStatus: (id, status) =>
        set((s) => ({ activities: s.activities.map((a) => (a.id === id ? { ...a, status } : a)) })),
    }),
    { name: "againerp-order-modules" },
  ),
);
