// invitations.ts
import type { Invitation } from "../types/invitation";

export const mockInvitations: Invitation[] = [
  {
    id: "inv-1",
    kind: "LANDLORD",
    token: "LL-ABC123",
    email: "newlandlord@example.com",
    createdAt: "2024-03-01T08:00:00Z",
    expiresAt: "2024-04-01T08:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "inv-2",
    kind: "MARKET_AGENT",
    token: "MA-XYZ789",
    createdAt: "2024-02-15T08:00:00Z",
    expiresAt: "2024-03-15T08:00:00Z",
    status: "EXPIRED",
  },
];

// notifications.ts
import type { AppNotification } from "../types/notification";

export const mockNotifications: AppNotification[] = [
  {
    id: "n-1",
    userId: "u-stu-1",
    kind: "PAYMENT_DUE",
    title: "Rent due soon",
    body: "Your April rent is due on 2024-04-01.",
    read: false,
    createdAt: "2024-03-25T08:00:00Z",
    link: "/student/payments",
  },
  {
    id: "n-2",
    userId: "u-stu-1",
    kind: "MESSAGE",
    title: "New message from landlord",
    body: "Rent reminder for April.",
    read: false,
    createdAt: "2024-03-20T10:15:00Z",
    link: "/student/messages",
  },
];

// ratings.ts
import type { Rating } from "../types/rating";

export const mockRatings: Rating[] = [
  {
    id: "rt-1",
    hostelId: "h-1",
    studentId: "u-stu-2",
    studentName: "Mary Wanjiku",
    stars: 5,
    comment: "Great place, very clean.",
    createdAt: "2024-02-10T10:00:00Z",
  },
  {
    id: "rt-2",
    hostelId: "h-1",
    studentId: "u-stu-3",
    studentName: "Peter Otieno",
    stars: 4,
    comment: "Good value for money.",
    createdAt: "2024-02-15T10:00:00Z",
  },
];
