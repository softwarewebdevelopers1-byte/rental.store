export interface Conversation {
  id: string;
  participants: string[];
  subject: "GENERAL" | "MAINTENANCE" | "PAYMENT";
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  read: boolean;
}
