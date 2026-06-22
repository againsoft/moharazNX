import { products } from "./products";
import { formatCurrency } from "@/lib/utils";

export type TrackingStep = {
  id: string;
  label: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
};

export type TrackedOrder = {
  orderNumber: string;
  email: string;
  status: "processing" | "shipped" | "out_for_delivery" | "delivered";
  statusLabel: string;
  placedAt: string;
  estimatedDelivery: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  items: { name: string; qty: number; image: string }[];
  total: number;
  shippingAddress: string;
  timeline: TrackingStep[];
};

const DEMO_ORDER_NUMBER = "ORD-DEMO01";
const DEMO_EMAIL = "demo@againshop.com";

function buildTimeline(status: TrackedOrder["status"]): TrackingStep[] {
  const steps: Omit<TrackingStep, "completed" | "current">[] = [
    { id: "placed", label: "Order placed", description: "We received your order", date: "Jun 10, 2026", time: "2:34 PM" },
    { id: "paid", label: "Payment confirmed", description: "Payment verified successfully", date: "Jun 10, 2026", time: "2:35 PM" },
    { id: "processing", label: "Processing", description: "Items picked and packed at warehouse", date: "Jun 11, 2026", time: "10:15 AM" },
    { id: "shipped", label: "Shipped", description: "Handed to courier partner", date: "Jun 11, 2026", time: "4:20 PM" },
    { id: "out", label: "Out for delivery", description: "Courier is on the way to your address", date: "Jun 12, 2026", time: "9:00 AM" },
    { id: "delivered", label: "Delivered", description: "Package delivered successfully", date: "Jun 12, 2026", time: "3:45 PM" },
  ];

  const statusIndex: Record<TrackedOrder["status"], number> = {
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
  };
  const active = statusIndex[status];

  return steps.map((s, i) => ({
    ...s,
    completed: i <= active,
    current: i === active,
  }));
}

function demoOrder(): TrackedOrder {
  const p1 = products.find((p) => p.id === "prod_0001");
  const p2 = products.find((p) => p.id === "prod_0002");
  return {
    orderNumber: DEMO_ORDER_NUMBER,
    email: DEMO_EMAIL,
    status: "out_for_delivery",
    statusLabel: "Out for delivery",
    placedAt: "Jun 10, 2026 · 2:34 PM",
    estimatedDelivery: "Jun 12, 2026",
    courier: "AgainExpress",
    trackingNumber: "AE-7845219630",
    trackingUrl: "#",
    items: [
      {
        name: p1?.name ?? "Premium Cotton T-Shirt",
        qty: 2,
        image: `https://picsum.photos/seed/prod_0001/80/80`,
      },
      {
        name: p2?.name ?? "Wireless Earbuds Pro",
        qty: 1,
        image: `https://picsum.photos/seed/prod_0002/80/80`,
      },
    ],
    total: 944,
    shippingAddress: "House 12, Road 5, Dhanmondi, Dhaka 1209",
    timeline: buildTimeline("out_for_delivery"),
  };
}

/** Lookup order — prototype: demo credentials or any ORD-* with valid email format */
export function lookupOrder(orderNumber: string, email: string): TrackedOrder | null {
  const num = orderNumber.trim().toUpperCase();
  const mail = email.trim().toLowerCase();

  if (!num || !mail) return null;

  if (num === DEMO_ORDER_NUMBER && mail === DEMO_EMAIL) {
    return demoOrder();
  }

  // Accept any ORD- prefixed number for prototype demo
  if (num.startsWith("ORD-") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    return {
      ...demoOrder(),
      orderNumber: num,
      email: mail,
      status: num.endsWith("99") ? "delivered" : num.endsWith("88") ? "shipped" : "processing",
      statusLabel: num.endsWith("99") ? "Delivered" : num.endsWith("88") ? "Shipped" : "Processing",
      timeline: buildTimeline(
        num.endsWith("99") ? "delivered" : num.endsWith("88") ? "shipped" : "processing",
      ),
    };
  }

  return null;
}

export const TRACK_ORDER_HINT = {
  orderNumber: DEMO_ORDER_NUMBER,
  email: DEMO_EMAIL,
};
