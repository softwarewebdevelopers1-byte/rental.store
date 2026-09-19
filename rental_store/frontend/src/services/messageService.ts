import { http } from "./apiClient";
import type { Conversation, Message } from "../types/message";

interface ConversationSummaryResponse {
  id: string;
  subject: Conversation["subject"];
  lastMessageAt: string;
  unreadCount: number;
  otherPartyId: string;
}

interface ConversationResponse {
  id: string;
  subject: Conversation["subject"];
  lastMessageAt: string;
  participants: Array<{ userId: string }>;
  messages: MessageResponse[];
}

interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

function toMessage(raw: MessageResponse): Message {
  return { ...raw, read: true };
}

export const messageService = {
  async listConversations(userId: string): Promise<Conversation[]> {
    const conversations = await http.get<ConversationSummaryResponse[]>(
      "/messages/conversations",
    );
    return conversations.map((conversation) => ({
      id: conversation.id,
      participants: [userId, conversation.otherPartyId],
      subject: conversation.subject,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount,
    }));
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    const conversation = await http.get<ConversationResponse>(
      `/messages/conversations/${conversationId}`,
    );
    return conversation.messages.map(toMessage);
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
  ): Promise<Message> {
    void senderId;
    const message = await http.post<MessageResponse>(
      `/messages/conversations/${conversationId}/messages`,
      { body },
    );
    return toMessage(message);
  },

  async markConversationRead(conversationId: string): Promise<void> {
    await http.post<void>(`/messages/conversations/${conversationId}/read`);
  },
};
