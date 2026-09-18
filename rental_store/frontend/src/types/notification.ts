export type NotificationKind =
  "PAYMENT_DUE" | "MESSAGE" | "MAINTENANCE" | "ORDER" | "SYSTEM";

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
