import { formatRelative } from "../../utils/formatDate";
import styles from "./MessageBubble.module.css";
import { Button } from "../common/Button";

interface MessageBubbleProps {
  body: string;
  attachments?: string[];
  mine: boolean;
  createdAt: string;
  senderName: string;
  messageId: string;
  onEdit?: (messageId: string, body: string) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
}

export function MessageBubble({
  body,
  attachments = [],
  mine,
  createdAt,
  senderName,
  messageId,
  onEdit,
  onDelete,
  onForward,
}: MessageBubbleProps) {
  return (
    <div className={`${styles.row} ${mine ? styles.mine : styles.theirs}`}>
      <div className={styles.bubble}>
        {!mine && <div className={styles.sender}>{senderName}</div>}
        <div className={styles.body}>{body}</div>
        {attachments.length > 0 && (
          <div>
            {attachments.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                View attachment
              </a>
            ))}
          </div>
        )}
        <div className={styles.time}>{formatRelative(createdAt)}</div>
        <div className={styles.actions}>
          {mine && onEdit && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(messageId, body)}>
              Edit
            </Button>
          )}
          {mine && onDelete && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(messageId)}>
              Delete
            </Button>
          )}
          {onForward && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onForward(messageId)}>
              Forward
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
