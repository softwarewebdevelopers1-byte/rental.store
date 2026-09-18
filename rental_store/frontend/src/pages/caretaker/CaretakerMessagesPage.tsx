import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useConversations, useMessages } from "../../hooks/useMessages";
import { PageHeader } from "../../components/layout/PageHeader";
import { ConversationList } from "../../components/messaging/ConversationList";
import { ChatWindow } from "../../components/messaging/ChatWindow";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { mockUsers } from "../../data/users";
import { mockConversations } from "../../data/messages";
import styles from "../student/StudentMessagesPage.module.css";

export default function CaretakerMessagesPage() {
  const { user } = useAuth();
  const { data: conversations, loading } = useConversations(user?.id ?? "");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currentConv = activeId ?? conversations[0]?.id ?? null;
  const {
    data: messages,
    loading: loadingMsgs,
    send,
  } = useMessages(currentConv);

  const nameFor = (id: string) =>
    mockUsers.find((u) => u.id === id)?.name ?? "Unknown";

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.participants
          .map(nameFor)
          .some((n) => n.toLowerCase().includes(search.toLowerCase())),
      ),
    [conversations, search],
  );

  const titleFor = (convId: string) => {
    const conv = mockConversations.find((c) => c.id === convId);
    if (!conv) return "Conversation";
    return conv.participants
      .filter((p) => p !== user?.id)
      .map(nameFor)
      .join(", ");
  };

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Messages"
        subtitle="Chat with students in your hostels."
      />
      {loading ? (
        <Skeleton height={480} radius="var(--radius-lg)" />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Once a student messages you, it will show up here."
        />
      ) : (
        <div className={styles.grid}>
          <ConversationList
            conversations={filtered}
            activeId={currentConv}
            onSelect={setActiveId}
            titleFor={(c) => titleFor(c.id)}
            previewFor={() => "Open to view"}
            search={search}
            onSearchChange={setSearch}
          />
          {currentConv && (
            <ChatWindow
              title={titleFor(currentConv)}
              messages={messages}
              loading={loadingMsgs}
              currentUserId={user?.id ?? ""}
              nameFor={nameFor}
              onSend={(body) => send(user?.id ?? "", body)}
            />
          )}
        </div>
      )}
    </div>
  );
}
