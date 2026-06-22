/** Shared order status badge styling — keep out of nav to avoid heavy client imports on detail pages. */
export function statusBadgeVariant(
  status: string,
): "success" | "outline" | "warning" | "muted" {
  switch (status) {
    case "completed":
    case "delivered":
      return "success";
    case "pending":
    case "processing":
    case "packed":
    case "confirmed":
      return "outline";
    case "cancelled":
    case "failed":
    case "returned":
    case "refunded":
      return "warning";
    default:
      return "muted";
  }
}
