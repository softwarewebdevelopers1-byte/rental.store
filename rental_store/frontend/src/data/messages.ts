import type { Conversation, Message } from "../types/message";

export const mockConversations: Conversation[] = [
  {
    id: "c-1",
    participants: ["u-stu-1", "u-ll-1"],
    subject: "GENERAL",
    lastMessageAt: "2024-03-20T10:15:00Z",
    unreadCount: 1,
  },
  {
    id: "c-2",
    participants: ["u-stu-1", "u-ct-1"],
    subject: "MAINTENANCE",
    lastMessageAt: "2024-03-19T08:40:00Z",
    unreadCount: 0,
  },
];

export const mockMessages: Message[] = [
  {
    id: "m-1",
    conversationId: "c-1",
    senderId: "u-ll-1",
    body: "Hi John, rent reminder for April.",
    createdAt: "2024-03-20T10:15:00Z",
    read: false,
  },
  {
    id: "m-2",
    conversationId: "c-1",
    senderId: "u-stu-1",
    body: "Noted, will pay by Friday.",
    createdAt: "2024-03-20T10:00:00Z",
    read: true,
  },
  {
    id: "m-3",
    conversationId: "c-2",
    senderId: "u-ct-1",
    body: "Plumber will come tomorrow at 9am.",
    createdAt: "2024-03-19T08:40:00Z",
    read: true,
  },
];
