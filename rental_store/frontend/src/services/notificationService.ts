import { mockNotifications } from "../data/notifications";
import type { AppNotification } from "../types/notification";
import { delay } from "../utils/delay";

export const notificationService = {
  async listForUser(userId: string): Promise<AppNotification[]> {
    return delay(
      mockNotifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },
  async markRead(id: string): Promise<void> {
    const n = mockNotifications.find((x) => x.id === id);
    if (n) n.read = true;
    await delay(undefined, 100);
  },
  async markAllRead(userId: string): Promise<void> {
    mockNotifications
      .filter((n) => n.userId === userId)
      .forEach((n) => (n.read = true));
    await delay(undefined, 100);
  },
};
