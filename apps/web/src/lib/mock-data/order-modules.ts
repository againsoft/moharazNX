// ─── Order sub-module mock data (Returns, Refunds, Payments, etc.) ───────────

export type ReturnStatus =
  | "requested"
  | "review"
  | "approved"
  | "received"
  | "inspected"
  | "refunded"
  | "completed"
  | "rejected";

export type RefundStatus = "pending" | "approved" | "processing" | "completed" | "rejected";
export type PaymentTxnStatus = "successful" | "pending" | "failed" | "refunded";
export type ShipmentStatus = "pending" | "packed" | "shipped" | "in_transit" | "delivered" | "failed";
export type RecoveryStatus = "not_contacted" | "email_sent" | "sms_sent" | "recovered" | "lost";
export type OrderActivityStatus = "open" | "in_progress" | "done" | "cancelled";
export type OrderActivityType =
  | "call"
  | "follow_up"
  | "address_verification"
  | "payment_verification"
  | "warehouse"
  | "courier"
  | "delivery"
  | "reminder"
  | "meeting"
  | "task";

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  review: "Under Review",
  approved: "Approved",
  received: "Received",
  inspected: "Inspected",
  refunded: "Refunded",
  completed: "Completed",
  rejected: "Rejected",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  processing: "Processing",
  completed: "Completed",
  rejected: "Rejected",
};

export const PAYMENT_TXN_STATUS_LABELS: Record<PaymentTxnStatus, string> = {
  successful: "Successful",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  shipped: "Shipped",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
};

export const RECOVERY_STATUS_LABELS: Record<RecoveryStatus, string> = {
  not_contacted: "Not Contacted",
  email_sent: "Email Sent",
  sms_sent: "SMS Sent",
  recovered: "Recovered",
  lost: "Lost",
};

export const ORDER_ACTIVITY_TYPE_LABELS: Record<OrderActivityType, string> = {
  call: "Call Customer",
  follow_up: "Follow Up",
  address_verification: "Address Verification",
  payment_verification: "Payment Verification",
  warehouse: "Warehouse Follow-up",
  courier: "Courier Follow-up",
  delivery: "Delivery Confirmation",
  reminder: "Reminder",
  meeting: "Meeting",
  task: "Task",
};

export type OrderReturn = {
  id: string;
  returnId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  sku: string;
  quantity: number;
  reason: string;
  status: ReturnStatus;
  amount: number;
  assignedStaff?: string;
  createdAt: string;
};

export type OrderRefund = {
  id: string;
  refundId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: string;
  reason: string;
  status: RefundStatus;
  approvedBy?: string;
  createdAt: string;
};

export type OrderPayment = {
  id: string;
  transactionId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  method: string;
  gateway: string;
  amount: number;
  status: PaymentTxnStatus;
  createdAt: string;
};

export type OrderShipment = {
  id: string;
  shipmentId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  courier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippingCost: number;
  shippedAt?: string;
  deliveredAt?: string;
  branch: string;
};

export type AbandonedCart = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  itemCount: number;
  cartValue: number;
  lastActivity: string;
  recoveryStatus: RecoveryStatus;
  aiSuggestion: string;
  products: string[];
};

export type OrderActivity = {
  id: string;
  title: string;
  type: OrderActivityType;
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  assignee: string;
  dueDate: string;
  status: OrderActivityStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
};

export const returnsSeed: OrderReturn[] = [
  { id: "ret_001", returnId: "RMA-5001", orderId: "ord_1004", orderNumber: "ORD-1004", customerName: "Rakibul Hasan", productName: "Wireless Earbuds Pro", sku: "SKU-0002", quantity: 1, reason: "Defective — left earbud not working", status: "requested", amount: 3499, assignedStaff: "Sadia Rahman", createdAt: "2026-06-12T09:00:00Z" },
  { id: "ret_002", returnId: "RMA-5002", orderId: "ord_1002", orderNumber: "ORD-1002", customerName: "Fatima Khan", productName: "Smart Watch Series 5", sku: "SKU-0005", quantity: 1, reason: "Wrong size band received", status: "review", amount: 8900, assignedStaff: "Rahim Uddin", createdAt: "2026-06-11T14:30:00Z" },
  { id: "ret_003", returnId: "RMA-5003", orderId: "ord_1005", orderNumber: "ORD-1005", customerName: "Nasrin Akter", productName: "Ceramic Coffee Mug Set", sku: "SKU-0003", quantity: 2, reason: "Damaged in shipping", status: "approved", amount: 1200, assignedStaff: "Sadia Rahman", createdAt: "2026-06-10T11:00:00Z" },
  { id: "ret_004", returnId: "RMA-5004", orderId: "ord_1003", orderNumber: "ORD-1003", customerName: "Tanvir Ahmed", productName: "Running Shoes Ultra", sku: "SKU-0004", quantity: 1, reason: "Size mismatch — ordered 42, received 40", status: "received", amount: 5200, assignedStaff: "Warehouse Team", createdAt: "2026-06-08T16:00:00Z" },
  { id: "ret_005", returnId: "RMA-5005", orderId: "ord_1001", orderNumber: "ORD-1001", customerName: "Rakibul Hasan", productName: "Premium Cotton T-Shirt", sku: "SKU-0001", quantity: 1, reason: "Color different from website", status: "inspected", amount: 899, assignedStaff: "Warehouse Team", createdAt: "2026-06-07T10:00:00Z" },
  { id: "ret_006", returnId: "RMA-5006", orderId: "ord_1006", orderNumber: "ORD-1006", customerName: "Jahidul Islam", productName: "Bluetooth Speaker Mini", sku: "SKU-0007", quantity: 1, reason: "Not as described — battery life poor", status: "completed", amount: 2100, createdAt: "2026-06-01T08:00:00Z" },
  { id: "ret_007", returnId: "RMA-5007", orderId: "ord_1007", orderNumber: "ORD-1007", customerName: "Unknown User", productName: "LED Desk Lamp", sku: "SKU-0010", quantity: 1, reason: "Changed mind", status: "rejected", amount: 1850, createdAt: "2026-05-28T12:00:00Z" },
];

export const refundsSeed: OrderRefund[] = [
  { id: "ref_001", refundId: "REF-3001", orderId: "ord_1006", orderNumber: "ORD-1006", customerName: "Jahidul Islam", amount: 2100, method: "bKash", reason: "Return completed — RMA-5006", status: "completed", approvedBy: "Manager", createdAt: "2026-06-02T10:00:00Z" },
  { id: "ref_002", refundId: "REF-3002", orderId: "ord_1002", orderNumber: "ORD-1002", customerName: "Fatima Khan", amount: 8900, method: "Card", reason: "Partial refund — shipping delay compensation", status: "pending", createdAt: "2026-06-12T11:00:00Z" },
  { id: "ref_003", refundId: "REF-3003", orderId: "ord_1003", orderNumber: "ORD-1003", customerName: "Tanvir Ahmed", amount: 5200, method: "Nagad", reason: "Return approved — awaiting item receipt", status: "approved", approvedBy: "Sadia Rahman", createdAt: "2026-06-09T09:00:00Z" },
  { id: "ref_004", refundId: "REF-3004", orderId: "ord_1008", orderNumber: "ORD-1008", customerName: "Mossiur Rahman", amount: 4500, method: "bKash", reason: "Duplicate payment charged", status: "processing", approvedBy: "Manager", createdAt: "2026-06-11T15:00:00Z" },
  { id: "ref_005", refundId: "REF-3005", orderId: "ord_1007", orderNumber: "ORD-1007", customerName: "Unknown User", amount: 1850, method: "COD", reason: "Return rejected — outside policy window", status: "rejected", approvedBy: "Manager", createdAt: "2026-05-29T10:00:00Z" },
];

export const paymentsSeed: OrderPayment[] = [
  { id: "pay_001", transactionId: "TXN-882910", orderId: "ord_1001", orderNumber: "ORD-1001", customerName: "Rakibul Hasan", method: "bKash", gateway: "bKash PG", amount: 12500, status: "successful", createdAt: "2026-06-08T08:05:00Z" },
  { id: "pay_002", transactionId: "TXN-882911", orderId: "ord_1002", orderNumber: "ORD-1002", customerName: "Fatima Khan", method: "Card", gateway: "SSLCommerz", amount: 8900, status: "successful", createdAt: "2026-06-09T10:00:00Z" },
  { id: "pay_003", transactionId: "TXN-882912", orderId: "ord_1003", orderNumber: "ORD-1003", customerName: "Tanvir Ahmed", method: "Nagad", gateway: "Nagad PG", amount: 5200, status: "pending", createdAt: "2026-06-10T14:00:00Z" },
  { id: "pay_004", transactionId: "TXN-882913", orderId: "ord_1004", orderNumber: "ORD-1004", customerName: "Nasrin Akter", method: "Card", gateway: "SSLCommerz", amount: 3499, status: "failed", createdAt: "2026-06-11T09:30:00Z" },
  { id: "pay_005", transactionId: "TXN-882914", orderId: "ord_1006", orderNumber: "ORD-1006", customerName: "Jahidul Islam", method: "bKash", gateway: "bKash PG", amount: 2100, status: "refunded", createdAt: "2026-06-01T08:00:00Z" },
  { id: "pay_006", transactionId: "TXN-882915", orderId: "ord_1005", orderNumber: "ORD-1005", customerName: "Nasrin Akter", method: "COD", gateway: "Manual", amount: 1200, status: "successful", createdAt: "2026-06-07T11:00:00Z" },
];

export const shipmentsSeed: OrderShipment[] = [
  { id: "shp_001", shipmentId: "SHP-7001", orderId: "ord_1001", orderNumber: "ORD-1001", customerName: "Rakibul Hasan", courier: "Pathao", trackingNumber: "PTH-88291", status: "in_transit", shippingCost: 120, shippedAt: "2026-06-09T14:00:00Z", branch: "Dhaka HQ" },
  { id: "shp_002", shipmentId: "SHP-7002", orderId: "ord_1004", orderNumber: "ORD-1004", customerName: "Nasrin Akter", courier: "RedX", trackingNumber: "RDX-99102", status: "delivered", shippingCost: 100, shippedAt: "2026-06-08T11:00:00Z", deliveredAt: "2026-06-09T16:30:00Z", branch: "Dhaka HQ" },
  { id: "shp_003", shipmentId: "SHP-7003", orderId: "ord_1002", orderNumber: "ORD-1002", customerName: "Fatima Khan", courier: "Steadfast", trackingNumber: "SF-44102", status: "packed", shippingCost: 150, branch: "Chittagong" },
  { id: "shp_004", shipmentId: "SHP-7004", orderId: "ord_1005", orderNumber: "ORD-1005", customerName: "Nasrin Akter", courier: "Pathao", trackingNumber: "PTH-88301", status: "shipped", shippingCost: 80, shippedAt: "2026-06-10T09:00:00Z", branch: "Dhaka HQ" },
  { id: "shp_005", shipmentId: "SHP-7005", orderId: "ord_1003", orderNumber: "ORD-1003", customerName: "Tanvir Ahmed", courier: "eCourier", trackingNumber: "EC-22001", status: "pending", shippingCost: 100, branch: "Sylhet" },
  { id: "shp_006", shipmentId: "SHP-7006", orderId: "ord_1008", orderNumber: "ORD-1008", customerName: "Mossiur Rahman", courier: "Pathao", trackingNumber: "PTH-88399", status: "failed", shippingCost: 120, shippedAt: "2026-06-11T10:00:00Z", branch: "Dhaka HQ" },
];

export const abandonedCartsSeed: AbandonedCart[] = [
  { id: "cart_001", customerName: "Karim Hassan", email: "karim@example.com", phone: "01711-998877", itemCount: 3, cartValue: 12400, lastActivity: "2026-06-12T18:30:00Z", recoveryStatus: "not_contacted", aiSuggestion: "Send 10% discount email — high intent, viewed checkout 3 times", products: ["Wireless Earbuds Pro", "USB-C Hub", "Phone Case"] },
  { id: "cart_002", customerName: "Ayesha Begum", email: "ayesha@example.com", phone: "01822-776655", itemCount: 1, cartValue: 8900, lastActivity: "2026-06-12T15:00:00Z", recoveryStatus: "email_sent", aiSuggestion: "Follow up with SMS in 24h — abandoned at payment step", products: ["Smart Watch Series 5"] },
  { id: "cart_003", customerName: "Guest User", email: "guest_4421@temp.com", phone: "—", itemCount: 2, cartValue: 3200, lastActivity: "2026-06-11T20:00:00Z", recoveryStatus: "sms_sent", aiSuggestion: "Low recovery probability — offer free shipping instead of discount", products: ["Ceramic Mug Set", "Scented Candle"] },
  { id: "cart_004", customerName: "Rakibul Hasan", email: "rakib@example.com", phone: "01711-234567", itemCount: 1, cartValue: 5200, lastActivity: "2026-06-10T12:00:00Z", recoveryStatus: "recovered", aiSuggestion: "Recovered via WhatsApp reminder — repeat customer", products: ["Running Shoes Ultra"] },
  { id: "cart_005", customerName: "Sabbir Ahmed", email: "sabbir@example.com", phone: "01933-445566", itemCount: 4, cartValue: 18500, lastActivity: "2026-06-08T09:00:00Z", recoveryStatus: "lost", aiSuggestion: "Cart expired — add to re-engagement campaign for laptop buyers", products: ["Dell XPS 15", "Laptop Bag", "Mouse", "Keyboard"] },
];

export const orderActivitiesSeed: OrderActivity[] = [
  { id: "act_001", title: "Call customer for address confirm", type: "call", orderId: "ord_1001", orderNumber: "ORD-1001", customerName: "Rakibul Hasan", assignee: "Sadia Rahman", dueDate: "2026-06-13", status: "open", priority: "high", createdAt: "2026-06-12T08:00:00Z" },
  { id: "act_002", title: "Payment verification — ORD-1003", type: "payment_verification", orderId: "ord_1003", orderNumber: "ORD-1003", customerName: "Tanvir Ahmed", assignee: "Finance Team", dueDate: "2026-06-13", status: "in_progress", priority: "high", createdAt: "2026-06-12T09:00:00Z" },
  { id: "act_003", title: "Warehouse follow-up — pack ORD-1002", type: "warehouse", orderId: "ord_1002", orderNumber: "ORD-1002", customerName: "Fatima Khan", assignee: "Warehouse Team", dueDate: "2026-06-13", status: "open", priority: "medium", createdAt: "2026-06-12T10:00:00Z" },
  { id: "act_004", title: "Courier follow-up — PTH-88291", type: "courier", orderId: "ord_1001", orderNumber: "ORD-1001", customerName: "Rakibul Hasan", assignee: "Rahim Uddin", dueDate: "2026-06-14", status: "open", priority: "medium", createdAt: "2026-06-11T14:00:00Z" },
  { id: "act_005", title: "Delivery confirmation — ORD-1004", type: "delivery", orderId: "ord_1004", orderNumber: "ORD-1004", customerName: "Nasrin Akter", assignee: "Call Center", dueDate: "2026-06-12", status: "done", priority: "low", createdAt: "2026-06-09T16:00:00Z" },
  { id: "act_006", title: "Follow up abandoned cart — Karim", type: "follow_up", customerName: "Karim Hassan", assignee: "Marketing Team", dueDate: "2026-06-13", status: "open", priority: "high", createdAt: "2026-06-12T18:00:00Z" },
  { id: "act_007", title: "Return inspection — RMA-5005", type: "task", orderId: "ord_1001", orderNumber: "ORD-1001", customerName: "Rakibul Hasan", assignee: "Warehouse Team", dueDate: "2026-06-13", status: "in_progress", priority: "medium", createdAt: "2026-06-07T11:00:00Z" },
];

export const orderReportsKpis = {
  totalRevenue: 2845000,
  orderVolume: 1847,
  avgOrderValue: 1540,
  returnRate: 4.2,
  refundRate: 2.8,
  paymentSuccessRate: 94.5,
  shipmentOnTime: 91.2,
  cartRecoveryRate: 18.5,
};
