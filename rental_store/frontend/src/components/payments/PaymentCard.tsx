import type { Payment } from "../../types/payment";
import { StatusBadge } from "../common/StatusBadge";
import { PriceDisplay } from "../common/PriceDisplay";
import { formatDate } from "../../utils/formatDate";
import styles from "./PaymentCard.module.css";

interface PaymentCardProps {
  label: string;
  amount?: number;
  status?: Payment["status"];
  dueDate?: string | null;
}

export function PaymentCard({
  label,
  amount,
  status,
  dueDate,
}: PaymentCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      {amount !== undefined && <PriceDisplay amount={amount} size="lg" />}
      <div className={styles.row}>
        {status && <StatusBadge status={status} />}
        {dueDate && (
          <span className={styles.date}>Due {formatDate(dueDate)}</span>
        )}
      </div>
    </div>
  );
}
