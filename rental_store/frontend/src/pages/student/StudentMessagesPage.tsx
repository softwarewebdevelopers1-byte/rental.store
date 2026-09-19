import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useConversations, useMessages } from "../../hooks/useMessages";
import { PageHeader } from "../../components/layout/PageHeader";
import { ConversationList } from "../../components/messaging/ConversationList";
import { ChatWindow } from "../../components/messaging/ChatWindow";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { studentService } from "../../services/studentService";
import { hostelService, type HostelSummary } from "../../services/hostelService";
import { messageService } from "../../services/messageService";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/common/Button";
import styles from "./StudentMessagesPage.module.css";

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const {
    data: conversations,
    loading: loadingConvs,
    reload: reloadConversations,
  } = useConversations(
    user?.id ?? "",
  );
  const [hostel, setHostel] = useState<HostelSummary | null>(null);
  const [startingWith, setStartingWith] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, { name: string }>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    void studentService.getSelf().then(async (student) => {
      if (!student?.hostelId) return;
      const currentHostel = await hostelService.getById(student.hostelId);
      if (!cancelled) setHostel(currentHostel);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const names = conversations.flatMap((conversation) =>
      Object.entries(conversation.participantNames)
        .map(([id, name]) => [id, { name }] as const),
    );
    setUsers(Object.fromEntries(names));
  }, [conversations]);

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
    users[id]?.name ??
    conversations.find((conversation) => conversation.participantNames[id])
      ?.participantNames[id] ??
    (id === user?.id ? user.name : "Unknown");

  const filtered = useMemo(
    () =>
      conversations.filter((c) =>
        c.participants
          .map(nameFor)
          .some((n) => n.toLowerCase().includes(search.toLowerCase())),
      ),
    [conversations, search, users, user?.id, user?.name],
  );

  const titleFor = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return "Conversation";
    const others = conv.participants.filter((p) => p !== user?.id);
    return others.map(nameFor).join(", ") || "You";
  };

  const previewFor = (convId: string) => {
    return conversations.some((conversation) => conversation.id === convId)
      ? "Open to view messages"
      : "";
  };

  const contacts = hostel
    ? [
        { id: hostel.landlordId, name: hostel.landlordName, role: "Landlord" },
        ...(hostel.caretakers ?? []).map((caretaker) => ({
          id: caretaker.id,
          name: caretaker.name,
          role: "Caretaker",
        })),
      ]
    : [];

  async function startConversation(userId: string) {
    setStartingWith(userId);
    try {
      const conversation = await messageService.getOrCreateDirect(userId);
      await reloadConversations();
      setActiveId(conversation.id);
      show("Conversation started.", "success");
    } catch (error) {
      show(
        error instanceof Error
          ? error.message
          : "Unable to start the conversation.",
        "error",
      );
    } finally {
      setStartingWith(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Messages"
        subtitle="Chat with your landlord and caretaker."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void Promise.all([reloadConversations(), reloadMessages()]);
            }}
            loading={loadingConvs || loadingMsgs}
          >
            Refresh
          </Button>
        }
      />
      {loadingConvs ? (
        <Skeleton height={480} radius="var(--radius-lg)" />
      ) : conversations.length === 0 ? (
        <div>
          <EmptyState
            title="No conversations yet"
            description="Start a conversation with your landlord or caretaker."
          />
          {contacts.length > 0 && (
            <div>
              {contacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant="secondary"
                  onClick={() => void startConversation(contact.id)}
                  loading={startingWith === contact.id}
                >
                  Message {contact.role} · {contact.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {contacts.length > 0 && (
            <div className={styles.contactActions}>
              <span className={styles.contactLabel}>Start a conversation:</span>
              {contacts.map((contact) => (
                <Button
                  key={contact.id}
                  size="sm"
                  variant="secondary"
                  onClick={() => void startConversation(contact.id)}
                  loading={startingWith === contact.id}
                >
                  {contact.role} · {contact.name}
                </Button>
              ))}
            </div>
          )}
          <div className={styles.grid}>
            <ConversationList
              conversations={filtered}
              activeId={currentConv}
              onSelect={setActiveId}
              titleFor={(c) => titleFor(c.id)}
              previewFor={(c) => previewFor(c.id)}
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
        </div>
      )}
    </div>
  );
}
