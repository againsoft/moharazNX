export type OrderPrintType = "invoice" | "packing-slip";

export function orderPrintUrl(orderId: string, type: OrderPrintType) {
  return `/orders/${orderId}/print/${type}`;
}

export function openOrderPrint(orderId: string, type: OrderPrintType) {
  const url = orderPrintUrl(orderId, type);
  window.open(url, "_blank", "noopener,noreferrer,width=900,height=1100");
}
