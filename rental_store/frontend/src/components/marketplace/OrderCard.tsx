import { Link } from "react-router-dom";
import { StatusBadge } from "../common/StatusBadge";
import { PriceDisplay } from "../common/PriceDisplay";
import { formatDate } from "../../utils/formatDate";
import type { Order } from "../../types/order";
import styles from "./OrderCard.module.css";

interface OrderCardProps {
  order: Order;
  to: string;
}

export function OrderCard({ order, to }: OrderCardProps) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.id}>#{order.id.slice(-6).toUpperCase()}</span>
        <StatusBadge status={order.status} />
      </div>
      <div className={styles.items}>
        {order.items.slice(0, 3).map((it, idx) => (
          <span key={`${it.refId}-${idx}`} className={styles.item}>
            {it.name} ×{it.quantity}
          </span>
        ))}
        {order.items.length > 3 && (
          <span className={styles.item}>+{order.items.length - 3} more</span>
        )}
      </div>
      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(order.createdAt)}</span>
        <PriceDisplay amount={order.total} size="sm" />
      </div>
    </Link>
  );
}
