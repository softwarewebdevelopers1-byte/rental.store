import { http } from "./apiClient";
import type { AppNotification } from "../types/notification";

interface Page<T> {
  content: T[];
}

interface NotificationResponse {
  id: string;
  kind: AppNotification["kind"];
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

function toNotification(raw: NotificationResponse, userId: string): AppNotification {
  return {
    id: raw.id,
    userId,
    kind: raw.kind,
    title: raw.title,
    body: raw.body,
    read: raw.read,
    createdAt: raw.createdAt,
    ...(raw.link ? { link: raw.link } : {}),
  };
}

export const notificationService = {
  async listForUser(userId: string): Promise<AppNotification[]> {
    const page = await http.get<Page<NotificationResponse>>("/notifications");
    return page.content.map((notification) => toNotification(notification, userId));
  },

  async markRead(id: string): Promise<void> {
    await http.post<void>(`/notifications/${id}/read`);
  },

  async markAllRead(userId: string): Promise<void> {
    void userId;
    await http.post<void>("/notifications/read-all");
  },
};
