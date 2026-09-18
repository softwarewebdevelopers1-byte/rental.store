import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageBubble } from "./MessageBubble";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import type { Message } from "../../types/message";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  title: string;
  subtitle?: string;
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  nameFor: (userId: string) => string;
  onSend: (body: string) => Promise<void> | void;
}

export function ChatWindow({
  title,
  subtitle,
  messages,
  loading,
  currentUserId,
  nameFor,
  onSend,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await onSend(draft.trim());
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>

      <div className={styles.body}>
        {loading ? (
          <LoadingSpinner label="Loading messages..." />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start the conversation below."
          />
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                body={m.body}
                mine={m.senderId === currentUserId}
                createdAt={m.createdAt}
                senderName={nameFor(m.senderId)}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
        />
        <Button type="submit" disabled={!draft.trim()} loading={sending}>
          Send
        </Button>
      </form>
    </section>
  );
}
