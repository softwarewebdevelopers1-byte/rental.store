import { useCallback, useEffect, useState } from "react";
import { messageService } from "../services/messageService";
import type { Conversation, Message } from "../types/message";

export function useConversations(userId: string) {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const interval = window.setInterval(() => {
      void reload();
    }, 5000);
    return () => window.clearInterval(interval);
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
    const interval = window.setInterval(() => {
      void reload();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [reload]);

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

  return { data, loading, error, reload, send };
}
