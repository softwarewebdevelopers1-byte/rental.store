import type { PaymentStatus } from "../types/payment";
import type { RoomStatus } from "../types/room";
import type { MaintenanceStatus } from "../types/maintenance";
import type { OrderStatus } from "../types/order";
import type { MembershipStatus } from "../types/user";
import type { InvitationStatus } from "../types/invitation";
import type { ConflictStatus } from "../types/conflict";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export const ROOM_STATUS_TONE: Record<RoomStatus, Tone> = {
  VACANT: "success",
  BOOKED: "info",
};

export const MEMBERSHIP_TONE: Record<MembershipStatus, Tone> = {
  PENDING: "warning",
  ACTIVE: "success",
  REJECTED: "danger",
  INACTIVE: "neutral",
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "danger",
};

export const MAINTENANCE_TONE: Record<MaintenanceStatus, Tone> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export const ORDER_TONE: Record<OrderStatus, Tone> = {
  PENDING_PAYMENT: "warning",
  PAID: "info",
  PREPARING: "info",
  READY: "info",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  RECEIVED: "success",
  CONFLICT: "danger",
  RESOLVED: "success",
  CANCELLED: "neutral",
};

export const INVITATION_TONE: Record<InvitationStatus, Tone> = {
  ACTIVE: "info",
  USED: "success",
  EXPIRED: "neutral",
  REVOKED: "danger",
};

export const CONFLICT_TONE: Record<ConflictStatus, Tone> = {
  OPEN: "warning",
  IN_REVIEW: "info",
  RESOLVED: "success",
  REJECTED: "neutral",
};
