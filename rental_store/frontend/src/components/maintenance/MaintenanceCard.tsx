import type { MaintenanceRequest } from "../../types/maintenance";
import { StatusBadge } from "../common/StatusBadge";
import { formatRelative } from "../../utils/formatDate";
import styles from "./MaintenanceCard.module.css";

interface MaintenanceCardProps {
  request: MaintenanceRequest;
  actions?: React.ReactNode;
}

export function MaintenanceCard({ request, actions }: MaintenanceCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>{request.title}</h3>
        <StatusBadge status={request.status} />
      </header>
      <div className={styles.meta}>
        <span className={styles.category}>{request.category}</span>
        <span className={styles.date}>
          · {formatRelative(request.createdAt)}
        </span>
      </div>
      <p className={styles.body}>{request.description}</p>
      {actions && <footer className={styles.actions}>{actions}</footer>}
    </article>
  );
}
