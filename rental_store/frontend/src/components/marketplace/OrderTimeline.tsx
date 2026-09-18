import type { Order, OrderStatus } from "../../types/order";
import { formatDateTime } from "../../utils/formatDate";
import styles from "./OrderTimeline.module.css";

const ORDER_FLOW: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RECEIVED",
];

const LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Order placed",
  PAID: "Order paid",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  RECEIVED: "Received",
  CONFLICT: "Conflict reported",
  RESOLVED: "Conflict resolved",
  CANCELLED: "Cancelled",
};

interface OrderTimelineProps {
  order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const reachedMap = new Map<OrderStatus, string>();
  order.timeline.forEach((t) => reachedMap.set(t.status, t.at));

  const flow =
    order.status === "CONFLICT" ||
    order.status === "RESOLVED" ||
    order.status === "CANCELLED"
      ? [...ORDER_FLOW]
      : ORDER_FLOW;

  return (
    <ol className={styles.timeline}>
      {flow.map((status) => {
        const reachedAt = reachedMap.get(status);
        const done = !!reachedAt;
        const current = order.status === status;
        return (
          <li
            key={status}
            className={`${styles.step} ${done ? styles.done : ""} ${current ? styles.current : ""}`}
          >
            <span className={styles.marker} aria-hidden>
              {done ? "✓" : "○"}
            </span>
            <div className={styles.text}>
              <div className={styles.label}>{LABELS[status]}</div>
              {reachedAt && (
                <div className={styles.time}>{formatDateTime(reachedAt)}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
