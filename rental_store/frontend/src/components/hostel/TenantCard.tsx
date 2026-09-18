import type { Student } from "../../types/user";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import styles from "./TenantCard.module.css";

interface TenantCardProps {
  student: Student;
  roomNumber?: string;
  onMessage?: () => void;
  onView?: () => void;
}

export function TenantCard({
  student,
  roomNumber,
  onMessage,
  onView,
}: TenantCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.avatar}>
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{student.name}</div>
          <div className={styles.email}>{student.email}</div>
        </div>
        <Badge tone="success">{student.membershipStatus}</Badge>
      </header>
      <div className={styles.meta}>
        {roomNumber && <span>Room {roomNumber}</span>}
        <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
      </div>
      <footer className={styles.actions}>
        {onMessage && (
          <Button size="sm" variant="secondary" onClick={onMessage}>
            Message
          </Button>
        )}
        {onView && (
          <Button size="sm" variant="ghost" onClick={onView}>
            View details
          </Button>
        )}
      </footer>
    </article>
  );
}
