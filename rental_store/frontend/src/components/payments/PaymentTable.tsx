import type { Payment } from "../../types/payment";
import { StatusBadge } from "../common/StatusBadge";
import { PriceDisplay } from "../common/PriceDisplay";
import { formatDate } from "../../utils/formatDate";
import styles from "./PaymentTable.module.css";

interface PaymentTableProps {
  payments: Payment[];
}

export function PaymentTable({ payments }: PaymentTableProps) {
  if (payments.length === 0) {
    return <div className={styles.empty}>No payments recorded yet.</div>;
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Status</th>
            <th>Due</th>
            <th>Paid</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>
                <PriceDisplay amount={p.amount} size="sm" />
              </td>
              <td>
                <StatusBadge status={p.status} />
              </td>
              <td>{formatDate(p.dueDate)}</td>
              <td>{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
              <td>{p.method ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
