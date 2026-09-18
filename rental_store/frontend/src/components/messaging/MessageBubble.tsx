import { formatRelative } from "../../utils/formatDate";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  body: string;
  mine: boolean;
  createdAt: string;
  senderName: string;
}

export function MessageBubble({
  body,
  mine,
  createdAt,
  senderName,
}: MessageBubbleProps) {
  return (
    <div className={`${styles.row} ${mine ? styles.mine : styles.theirs}`}>
      <div className={styles.bubble}>
        {!mine && <div className={styles.sender}>{senderName}</div>}
        <div className={styles.body}>{body}</div>
        <div className={styles.time}>{formatRelative(createdAt)}</div>
      </div>
    </div>
  );
}
