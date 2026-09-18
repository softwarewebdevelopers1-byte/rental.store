import { mockConversations, mockMessages } from "../data/messages";
import type { Conversation, Message } from "../types/message";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export const messageService = {
  async listConversations(userId: string): Promise<Conversation[]> {
    return delay(
      mockConversations
        .filter((c) => c.participants.includes(userId))
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    );
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    return delay(
      mockMessages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    );
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
  ): Promise<Message> {
    const msg: Message = {
      id: generateId("m"),
      conversationId,
      senderId,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    };
    mockMessages.push(msg);

    const conv = mockConversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageAt = msg.createdAt;
      conv.unreadCount = 0;
    }
    return delay(msg, 150);
  },

  async markConversationRead(conversationId: string): Promise<void> {
    mockConversations
      .filter((c) => c.id === conversationId)
      .forEach((c) => (c.unreadCount = 0));
    mockMessages
      .filter((m) => m.conversationId === conversationId)
      .forEach((m) => (m.read = true));
    await delay(undefined, 100);
  },
};
