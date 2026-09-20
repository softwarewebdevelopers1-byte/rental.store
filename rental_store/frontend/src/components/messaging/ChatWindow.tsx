import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageBubble } from "./MessageBubble";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import { useToast } from "../../hooks/useToast";
import { FileUpload } from "../common/FileUpload";
import type { Message } from "../../types/message";
import type { MessageTarget } from "../../types/message";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  title: string;
  subtitle?: string;
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  nameFor: (userId: string) => string;
  onSend: (body: string, attachments: string[]) => Promise<void> | void;
  forwardTargets?: MessageTarget[];
  onEdit: (messageId: string, body: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onForward: (messageId: string, targetUserId: string) => Promise<void>;
}

export function ChatWindow({
  title,
  subtitle,
  messages,
  loading,
  currentUserId,
  nameFor,
  onSend,
  forwardTargets = [],
  onEdit,
  onDelete,
  onForward,
}: ChatWindowProps) {
  const { show } = useToast();
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);
  const [forwardingId, setForwardingId] = useState<string | null>(null);
  const [forwardTarget, setForwardTarget] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await onSend(draft.trim(), attachments);
      setDraft("");
      setAttachments([]);
    } finally {
      setSending(false);
    }
  }

  async function saveEdit() {
      if (!editing?.body.trim()) return;
      try {
        await onEdit(editing.id, editing.body.trim());
        setEditing(null);
        show("Message edited.", "success");
      } catch (error) {
        show(error instanceof Error ? error.message : "Unable to edit message.", "error");
      }
    }

  async function deleteMessage(messageId: string) {
      try {
        await onDelete(messageId);
        show("Message deleted.", "success");
      } catch (error) {
        show(error instanceof Error ? error.message : "Unable to delete message.", "error");
      }
    }

  async function forwardMessage(messageId: string, targetUserId: string) {
      try {
        await onForward(messageId, targetUserId);
        setForwardingId(null);
        show("Message forwarded.", "success");
      } catch (error) {
        show(error instanceof Error ? error.message : "Unable to forward message.", "error");
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
              editing?.id === m.id ? (
                <div key={m.id} className={styles.editRow}>
                  <input
                    className={styles.input}
                    value={editing.body}
                    onChange={(event) => setEditing({ ...editing, body: event.target.value })}
                    autoFocus
                  />
                  <Button type="button" size="sm" onClick={() => void saveEdit()}>Save</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              ) : (
                <MessageBubble
                  key={m.id}
                  messageId={m.id}
                  body={m.body}
                  attachments={m.attachments}
                  mine={m.senderId === currentUserId}
                  createdAt={m.createdAt}
                  senderName={nameFor(m.senderId)}
                  onEdit={(id, body) => setEditing({ id, body })}
                  onDelete={(id) => void deleteMessage(id)}
                  onForward={(id) => {
                    setForwardingId(id);
                    setForwardTarget(forwardTargets[0]?.id ?? "");
                  }}
                />
              )
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      {forwardingId && (
        <div className={styles.forwardRow}>
          <select
            value={forwardTarget}
            onChange={(event) => setForwardTarget(event.target.value)}
            aria-label="Forward to"
          >
            <option value="">Select a user</option>
            {forwardTargets.map((target) => (
              <option key={target.id} value={target.id}>{target.name}</option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            disabled={!forwardTarget}
            onClick={() => {
              void forwardMessage(forwardingId, forwardTarget);
            }}
          >
            Forward
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setForwardingId(null)}>
            Cancel
          </Button>
        </div>
      )}

      <form className={styles.composer} onSubmit={handleSubmit}>
        <FileUpload
          folder="messages"
          label=""
          value={attachments}
          onChange={setAttachments}
        />
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
        />
        <Button type="submit" disabled={!draft.trim() && attachments.length === 0} loading={sending}>
          Send
        </Button>
      </form>
    </section>
  );
}
