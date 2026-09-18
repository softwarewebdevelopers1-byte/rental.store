import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../utils/formatDate";
import type { Conflict } from "../../types/conflict";
import styles from "./ConflictCard.module.css";

interface ConflictCardProps {
  conflict: Conflict;
  actions?: React.ReactNode;
}

export function ConflictCard({ conflict, actions }: ConflictCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <div className={styles.id}>
            Order #{conflict.orderId.slice(-6).toUpperCase()}
          </div>
          <div className={styles.date}>{formatDate(conflict.createdAt)}</div>
        </div>
        <StatusBadge status={conflict.status} />
      </header>
      <div className={styles.issue}>{conflict.issue.replace(/_/g, " ")}</div>
      <p className={styles.description}>{conflict.description}</p>
      {conflict.resolution && (
        <div className={styles.resolution}>
          <strong>Resolution:</strong> {conflict.resolution}
        </div>
      )}
      {actions && <footer className={styles.actions}>{actions}</footer>}
    </article>
  );
}
