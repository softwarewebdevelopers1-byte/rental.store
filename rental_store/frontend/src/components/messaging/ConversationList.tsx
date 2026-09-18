import type { Conversation } from "../../types/message";
import { formatRelative } from "../../utils/formatDate";
import { SearchBar } from "../common/SearchBar";
import styles from "./ConversationList.module.css";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  titleFor: (c: Conversation) => string;
  previewFor: (c: Conversation) => string;
  search: string;
  onSearchChange: (v: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  titleFor,
  previewFor,
  search,
  onSearchChange,
}: ConversationListProps) {
  return (
    <aside className={styles.wrap}>
      <div className={styles.search}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search conversations"
        />
      </div>
      {conversations.length === 0 ? (
        <div className={styles.empty}>No conversations yet.</div>
      ) : (
        <ul className={styles.list}>
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                className={`${styles.item} ${activeId === c.id ? styles.active : ""}`}
                onClick={() => onSelect(c.id)}
              >
                <div className={styles.itemTop}>
                  <span className={styles.title}>{titleFor(c)}</span>
                  <span className={styles.time}>
                    {formatRelative(c.lastMessageAt)}
                  </span>
                </div>
                <div className={styles.itemBottom}>
                  <span className={styles.preview}>{previewFor(c)}</span>
                  {c.unreadCount > 0 && (
                    <span className={styles.unread}>{c.unreadCount}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
