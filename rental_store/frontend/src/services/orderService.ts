import { mockOrders } from "../data/orders";
import type { Order, OrderStatus } from "../types/order";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

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

export const orderService = {
  async listForStudent(studentId: string): Promise<Order[]> {
    return delay(
      mockOrders
        .filter((o) => o.studentId === studentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listForAgent(agentId: string): Promise<Order[]> {
    return delay(
      mockOrders
        .filter((o) => o.agentId === agentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async getById(id: string): Promise<Order | null> {
    return delay(mockOrders.find((o) => o.id === id) ?? null);
  },

  async create(input: CreateOrderInput): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = {
      id: generateId("o"),
      studentId: input.studentId,
      agentId: input.agentId,
      items: input.items,
      total: input.total,
      status: "PENDING_PAYMENT",
      createdAt: now,
      updatedAt: now,
      timeline: [{ status: "PENDING_PAYMENT", at: now }],
    };
    mockOrders.push(order);
    return delay(order);
  },

  async payOrder(
    orderId: string,
    input: PayOrderInput,
  ): Promise<Order | null> {
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) return delay(null);
    const now = new Date().toISOString();
    order.status = "PAID";
    order.mpesaPhone = input.phone;
    order.mpesaCode = input.mpesaCode;
    order.updatedAt = now;
    order.timeline.push({ status: "PAID", at: now });
    return delay(order);
  },

  async advanceStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) return delay(null);
    const now = new Date().toISOString();
    order.status = status;
    order.updatedAt = now;
    order.timeline.push({ status, at: now });
    return delay(order);
  },

  async confirmReceived(id: string): Promise<Order | null> {
    return this.advanceStatus(id, "RECEIVED");
  },

  async markConflict(id: string): Promise<Order | null> {
    return this.advanceStatus(id, "CONFLICT");
  },
};