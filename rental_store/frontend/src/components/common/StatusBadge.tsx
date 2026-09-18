import { Badge } from "./Badge";

export function StatusBadge({ status }: { status: string }) {
  const tone = pickTone(status);
  return <Badge tone={tone}>{status.replace(/_/g, " ")}</Badge>;
}

function pickTone(
  status: string,
): "neutral" | "info" | "success" | "warning" | "danger" {
  const s = status.toUpperCase();
  if (
    [
      "ACTIVE",
      "APPROVED",
      "PAID",
      "RESOLVED",
      "RECEIVED",
      "DELIVERED",
      "VACANT",
      "USED",
      "CLOSED",
    ].includes(s)
  )
    return "success";
  if (
    ["PENDING", "OPEN", "PENDING_PAYMENT", "IN_REVIEW", "OVERDUE"].includes(s)
  )
    return "warning";
  if (["REJECTED", "CONFLICT", "CANCELLED", "REVOKED", "DANGER"].includes(s))
    return "danger";
  if (
    [
      "BOOKED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "IN_PROGRESS",
      "PAID",
    ].includes(s)
  )
    return "info";
  return "neutral";
}
