import { http } from "./apiClient";
import type { Order, OrderStatus } from "../types/order";

export interface CreateOrderInput {
  studentId: string;
  agentId: string;
  items: Order["items"];
  total: number;
}

export interface PayOrderInput {
  phone: string;
  mpesaCode: string;
}

interface Page<T> {
  content: T[];
}

interface OrderItemResponse {
  kind: Order["items"][number]["kind"];
  refId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface OrderResponse {
  id: string;
  status: OrderStatus;
  total: number;
  studentId: string;
  agentId: string;
  items: OrderItemResponse[];
  timeline: Array<{ status: OrderStatus; at: string }>;
  createdAt: string;
  updatedAt: string;
}

interface OrderSummaryResponse {
  id: string;
  status: OrderStatus;
  total: number;
  studentId: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

function toOrder(raw: OrderResponse): Order {
  return {
    id: raw.id,
    studentId: raw.studentId,
    agentId: raw.agentId,
    items: raw.items.map((item) => ({ ...item })),
    total: raw.total,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    timeline: raw.timeline.map(({ status, at }) => ({ status, at })),
  };
}

function toSummary(raw: OrderSummaryResponse): Order {
  return {
    id: raw.id,
    studentId: raw.studentId,
    agentId: raw.agentId,
    items: [],
    total: raw.total,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    timeline: [],
  };
}

export const orderService = {
  async listForStudent(studentId: string): Promise<Order[]> {
    void studentId;
    const page = await http.get<Page<OrderSummaryResponse>>("/orders/me");
    return page.content.map(toSummary);
  },

  async listForAgent(agentId: string): Promise<Order[]> {
    void agentId;
    const page = await http.get<Page<OrderSummaryResponse>>("/orders/agent");
    return page.content.map(toSummary);
  },

  async getById(id: string, viewer: "student" | "agent" = "student"): Promise<Order | null> {
    const path = viewer === "agent" ? `/orders/agent/${id}` : `/orders/me/${id}`;
    return toOrder(await http.get<OrderResponse>(path));
  },

  async create(input: CreateOrderInput): Promise<Order> {
    void input.studentId;
    void input.agentId;
    void input.total;
    const raw = await http.post<OrderResponse>("/orders/me", {
      items: input.items.map(({ kind, refId, quantity }) => ({ kind, refId, quantity })),
    });
    return toOrder(raw);
  },

  async payOrder(orderId: string, input: PayOrderInput): Promise<Order | null> {
    void orderId;
    void input;
    throw new Error("Order payment is not exposed by the backend service layer");
  },

  async advanceStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const raw = await http.patch<OrderResponse>(`/orders/agent/${id}/status`, {
      status,
    });
    return toOrder(raw);
  },

  async confirmReceived(id: string): Promise<Order | null> {
    const raw = await http.post<OrderResponse>(`/orders/me/${id}/receive`);
    return toOrder(raw);
  },

  async markConflict(id: string): Promise<Order | null> {
    await http.post(`/conflicts/me/orders/${id}`, {
      issue: "OTHER",
      description: "Order marked as conflicted",
      attachments: [],
    });
    return this.getById(id, "student");
  },
};
