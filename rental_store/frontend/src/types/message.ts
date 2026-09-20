export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  subject: "GENERAL" | "MAINTENANCE" | "PAYMENT";
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: string[];
  createdAt: string;
  read: boolean;
}

export interface MessageTarget {
  id: string;
  name: string;
}
