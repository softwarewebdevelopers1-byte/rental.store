import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useConversations, useMessages } from "../../hooks/useMessages";
import { PageHeader } from "../../components/layout/PageHeader";
import { ConversationList } from "../../components/messaging/ConversationList";
import { ChatWindow } from "../../components/messaging/ChatWindow";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import styles from "../student/StudentMessagesPage.module.css";

export default function LandlordMessagesPage() {
  const { user } = useAuth();
  const {
    data: conversations,
    loading,
    reload: reloadConversations,
  } = useConversations(user?.id ?? "");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currentConv = activeId ?? conversations[0]?.id ?? null;
  const {
    data: messages,
    loading: loadingMsgs,
    reload: reloadMessages,
    send,
    edit,
    remove,
    forward,
  } = useMessages(currentConv);

  const nameFor = (id: string) =>
    conversations.find((conversation) => conversation.participantNames[id])
      ?.participantNames[id] ?? (id === user?.id ? user.name : "Unknown");

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.participants
          .map(nameFor)
          .some((n) => n.toLowerCase().includes(search.toLowerCase())),
      ),
    [conversations, search, user?.id, user?.name],
  );

  const titleFor = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
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
        subtitle="Chat with your tenants and caretakers."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void Promise.all([reloadConversations(), reloadMessages()]);
            }}
            loading={loading || loadingMsgs}
          >
            Refresh
          </Button>
        }
      />
      {loading ? (
        <Skeleton height={480} radius="var(--radius-lg)" />
      ) : conversations.length === 0 ? (
        <EmptyState title="No conversations yet" />
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
              forwardTargets={conversations
                .flatMap((conversation) => conversation.participants)
                .filter((id) => id !== user?.id)
                .filter((id, index, all) => all.indexOf(id) === index)
                .map((id) => ({ id, name: nameFor(id) }))}
              onEdit={edit}
              onDelete={remove}
              onForward={forward}
            />
          )}
        </div>
      )}
    </div>
  );
}
