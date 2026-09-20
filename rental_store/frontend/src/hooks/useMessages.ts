import { useCallback, useEffect, useRef, useState } from "react";
import { messageService } from "../services/messageService";
import { openMessageStream } from "../services/messageStream";
import { getAuthToken } from "../services/authToken";
import type { Conversation, Message } from "../types/message";

function toIncomingMessage(payload: unknown): Message | null {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  if (
    typeof value.id !== "string" ||
    typeof value.conversationId !== "string" ||
    typeof value.senderId !== "string" ||
    typeof value.body !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    conversationId: value.conversationId,
    senderId: value.senderId,
    body: value.body,
    createdAt: value.createdAt,
    read: true,
  };
}

export function useConversations(userId: string) {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await messageService.listConversations(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
    const token = getAuthToken();
    if (!token) return;
    return openMessageStream(token, {
      onMessage: (payload) => {
        const message = toIncomingMessage(payload);
        if (!message) return;
        const knownConversation = dataRef.current.some(
          (conversation) => conversation.id === message.conversationId,
        );
        setData((previous) =>
          previous.map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  lastMessageAt: message.createdAt,
                  unreadCount: conversation.unreadCount + 1,
                }
              : conversation,
          ),
        );
        if (!knownConversation) void reload();
      },
    });
  }, [reload]);

  return { data, loading, error, reload };
}

export function useMessages(conversationId: string | null) {
  const [data, setData] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!conversationId) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await messageService.listMessages(conversationId));
      await messageService.markConversationRead(conversationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void reload();
    const token = getAuthToken();
    if (!token) return;
    return openMessageStream(token, {
      onMessage: (payload) => {
        const message = toIncomingMessage(payload);
        if (!message || message.conversationId !== conversationId) return;
        setData((previous) =>
          previous.some((existing) => existing.id === message.id)
            ? previous
            : [...previous, message],
        );
      },
    });
  }, [conversationId, reload]);

  const send = useCallback(
    async (senderId: string, body: string) => {
      if (!conversationId || !body.trim()) return;
      const msg = await messageService.sendMessage(
        conversationId,
        senderId,
        body.trim(),
      );
      setData((prev) => [...prev, msg]);
    },
    [conversationId],
  );

  const edit = useCallback(async (messageId: string, body: string) => {
    const updated = await messageService.editMessage(messageId, body);
    setData((prev) => prev.map((message) => message.id === messageId ? updated : message));
  }, []);

  const remove = useCallback(async (messageId: string) => {
    await messageService.deleteMessage(messageId);
    setData((prev) => prev.filter((message) => message.id !== messageId));
  }, []);

  const forward = useCallback(
    async (messageId: string, targetUserId: string) => {
      await messageService.forwardMessage(messageId, targetUserId);
    },
    [],
  );

  return { data, loading, error, reload, send, edit, remove, forward };
}
