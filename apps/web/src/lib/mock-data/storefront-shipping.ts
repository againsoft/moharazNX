import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS } from "./storefront-checkout";

export { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS };

export const DELIVERY_ZONES = [
  {
    zone: "Dhaka city",
    standard: "1–2 business days",
    express: "Next business day",
    note: "Express available until 4 PM",
  },
  {
    zone: "Dhaka suburbs",
    standard: "2–3 business days",
    express: "Next business day",
    note: "Gazipur, Narayanganj, Savar",
  },
  {
    zone: "Outside Dhaka",
    standard: "3–5 business days",
    express: "2 business days",
    note: "Major cities via courier partners",
  },
];

export const RETURN_POLICY = {
  windowDays: 30,
  condition: "Unused, original packaging, tags attached",
  refundTime: "5–7 business days after inspection",
  exclusions: [
    "Personal care items (opened)",
    "Digital products & gift cards",
    "Custom or made-to-order items",
    "Final sale / clearance (marked at checkout)",
  ],
};

export const RETURN_STEPS = [
  { step: 1, title: "Start a return", body: "Email hello@againshop.com with your order number or visit Contact us." },
  { step: 2, title: "Get approval", body: "We'll send a return authorization and pickup or drop-off instructions within 24 hours." },
  { step: 3, title: "Ship or hand over", body: "Pack items securely. Our courier partner collects from Dhaka; outside Dhaka via designated hub." },
  { step: 4, title: "Refund processed", body: "Once inspected, refund to original payment method or bKash within 5–7 business days." },
];

export const SHIPPING_FAQ = [
  {
    q: "When do I get free shipping?",
    a: `Orders over ৳${FREE_SHIPPING_THRESHOLD.toLocaleString()} qualify for free standard shipping nationwide. Express delivery is always charged separately.`,
  },
  {
    q: "Can I change my delivery address after ordering?",
    a: "Contact us within 2 hours of placing your order. Once dispatched, address changes may not be possible.",
  },
  {
    q: "Do you deliver outside Bangladesh?",
    a: "Currently we ship within Bangladesh only. International shipping is planned for a future release.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "Take photos of the package and product, then contact us within 48 hours. We'll arrange a free replacement or full refund.",
  },
  {
    q: "How do exchanges work?",
    a: "Start a return and note you'd like an exchange. If the replacement item is in stock, we'll ship it once we receive your return.",
  },
  {
    q: "Are return shipping costs covered?",
    a: "Free return pickup in Dhaka for defective or wrong items. For change-of-mind returns, a ৳80 pickup fee may apply outside Dhaka.",
  },
];
