export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RECEIVED"
  | "CONFLICT"
  | "RESOLVED"
  | "CANCELLED";

export interface OrderItem {
  kind: "PRODUCT" | "PACK";
  refId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  studentId: string;
  agentId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: { status: OrderStatus; at: string }[];
  mpesaPhone?: string;
  mpesaCode?: string;
}