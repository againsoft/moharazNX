import { products } from "./products";

export type AccountOrderStatus =
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested";

export type AccountOrder = {
  id: string;
  orderNumber: string;
  placedAt: string;
  status: AccountOrderStatus;
  statusLabel: string;
  itemCount: number;
  total: number;
  items: { name: string; qty: number; image: string; slug: string }[];
  canReorder: boolean;
  canReturn: boolean;
  canTrack: boolean;
};

export type AccountReturn = {
  id: string;
  rmaNumber: string;
  orderNumber: string;
  productName: string;
  status: "pending" | "approved" | "received" | "refunded" | "rejected";
  statusLabel: string;
  requestedAt: string;
  reason: string;
};

export type AccountAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  district: string;
  postalCode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export type AccountReviewItem = {
  id: string;
  productName: string;
  productSlug: string;
  image: string;
  status: "pending" | "submitted";
  rating?: number;
  submittedAt?: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: "open" | "waiting" | "resolved";
  statusLabel: string;
  updatedAt: string;
  preview: string;
};

export type RewardTier = "bronze" | "silver" | "gold" | "platinum";

export type AccountDashboard = {
  rewardsPoints: number;
  rewardsTier: RewardTier;
  rewardsTierLabel: string;
  pointsToNextTier: number;
  walletBalance: number;
  pendingReviews: number;
  openTickets: number;
  aiTips: string[];
};

const p1 = products.find((p) => p.id === "prod_0001");
const p2 = products.find((p) => p.id === "prod_0002");
const p3 = products.find((p) => p.id === "prod_0003");

export const accountDashboard: AccountDashboard = {
  rewardsPoints: 1240,
  rewardsTier: "silver",
  rewardsTierLabel: "Silver member",
  pointsToNextTier: 260,
  walletBalance: 850,
  pendingReviews: 2,
  openTickets: 1,
  aiTips: [
    "Reorder your Wireless Earbuds — batteries last ~8 months on average.",
    "You have ৳850 store credit — apply it at checkout.",
    "2 products from recent orders are eligible for review rewards (+50 pts each).",
  ],
};

export const accountOrders: AccountOrder[] = [
  {
    id: "ord_1",
    orderNumber: "ORD-2026-10482",
    placedAt: "Jun 12, 2026",
    status: "out_for_delivery",
    statusLabel: "Out for delivery",
    itemCount: 2,
    total: 4280,
    items: [
      {
        name: p1?.name ?? "Premium Cotton T-Shirt",
        qty: 2,
        image: `https://picsum.photos/seed/prod_0001/80/80`,
        slug: p1?.slug ?? "premium-cotton-t-shirt",
      },
      {
        name: p2?.name ?? "Wireless Earbuds Pro",
        qty: 1,
        image: `https://picsum.photos/seed/prod_0002/80/80`,
        slug: p2?.slug ?? "wireless-earbuds-pro",
      },
    ],
    canReorder: false,
    canReturn: false,
    canTrack: true,
  },
  {
    id: "ord_2",
    orderNumber: "ORD-2026-09831",
    placedAt: "May 28, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    itemCount: 1,
    total: 1899,
    items: [
      {
        name: p3?.name ?? "Smart Watch Series 5",
        qty: 1,
        image: `https://picsum.photos/seed/prod_0003/80/80`,
        slug: p3?.slug ?? "smart-watch-series-5",
      },
    ],
    canReorder: true,
    canReturn: true,
    canTrack: true,
  },
  {
    id: "ord_3",
    orderNumber: "ORD-2026-08720",
    placedAt: "May 10, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    itemCount: 3,
    total: 5620,
    items: [
      {
        name: p2?.name ?? "Wireless Earbuds Pro",
        qty: 1,
        image: `https://picsum.photos/seed/prod_0002/80/80`,
        slug: p2?.slug ?? "wireless-earbuds-pro",
      },
    ],
    canReorder: true,
    canReturn: false,
    canTrack: true,
  },
];

export const accountReturns: AccountReturn[] = [
  {
    id: "rma_1",
    rmaNumber: "RMA-2026-0041",
    orderNumber: "ORD-2026-08720",
    productName: p1?.name ?? "Premium Cotton T-Shirt",
    status: "refunded",
    statusLabel: "Refunded",
    requestedAt: "May 15, 2026",
    reason: "Wrong size",
  },
];

export const accountAddresses: AccountAddress[] = [
  {
    id: "addr_1",
    label: "Home",
    name: "Rahim Ahmed",
    phone: "+880 1712-345678",
    line1: "House 12, Road 5",
    line2: "Dhanmondi",
    district: "Dhaka",
    postalCode: "1209",
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: "addr_2",
    label: "Office",
    name: "Rahim Ahmed",
    phone: "+880 1712-345678",
    line1: "Level 8, Again Tower",
    district: "Dhaka",
    postalCode: "1212",
    isDefaultShipping: false,
    isDefaultBilling: false,
  },
];

export const accountReviews: AccountReviewItem[] = [
  {
    id: "rev_pending_1",
    productName: p3?.name ?? "Smart Watch Series 5",
    productSlug: p3?.slug ?? "smart-watch-series-5",
    image: `https://picsum.photos/seed/prod_0003/80/80`,
    status: "pending",
  },
  {
    id: "rev_pending_2",
    productName: p2?.name ?? "Wireless Earbuds Pro",
    productSlug: p2?.slug ?? "wireless-earbuds-pro",
    image: `https://picsum.photos/seed/prod_0002/80/80`,
    status: "pending",
  },
  {
    id: "rev_sub_1",
    productName: p1?.name ?? "Premium Cotton T-Shirt",
    productSlug: p1?.slug ?? "premium-cotton-t-shirt",
    image: `https://picsum.photos/seed/prod_0001/80/80`,
    status: "submitted",
    rating: 5,
    submittedAt: "May 12, 2026",
  },
];

export const rewardHistory = [
  { id: "rh_1", label: "Order ORD-2026-09831", points: 95, date: "May 28, 2026" },
  { id: "rh_2", label: "Product review bonus", points: 50, date: "May 12, 2026" },
  { id: "rh_3", label: "Welcome bonus", points: 200, date: "Apr 1, 2026" },
  { id: "rh_4", label: "Redeemed at checkout", points: -150, date: "Apr 18, 2026" },
];

export const walletHistory = [
  { id: "wh_1", label: "Return refund RMA-2026-0041", amount: 850, date: "May 18, 2026" },
  { id: "wh_2", label: "Applied to order ORD-2026-08720", amount: -200, date: "May 10, 2026" },
];

export const notificationPrefs = {
  orderUpdates: true,
  promotions: true,
  priceDrops: false,
  sms: true,
  push: false,
};

export const supportTickets: SupportTicket[] = [
  {
    id: "tkt_1",
    subject: "Delivery delay — ORD-2026-10482",
    status: "waiting",
    statusLabel: "Awaiting reply",
    updatedAt: "Jun 13, 2026",
    preview: "Courier shows out for delivery since yesterday…",
  },
  {
    id: "tkt_2",
    subject: "Warranty claim for earbuds",
    status: "resolved",
    statusLabel: "Resolved",
    updatedAt: "May 20, 2026",
    preview: "Replacement unit shipped. Case closed.",
  },
];

export function getAccountOrder(id: string) {
  return accountOrders.find((o) => o.id === id);
}
