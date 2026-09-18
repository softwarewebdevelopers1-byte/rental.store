import { mockPayments } from "../data/payments";
import { mockRooms } from "../data/rooms";
import { mockStudents } from "../data/users";
import type { Payment } from "../types/payment";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export interface StudentPaymentSummary {
  currentRent: number;
  status: Payment["status"];
  nextDueDate: string | null;
  history: Payment[];
}

export interface StkPushInput {
  phone: string;
  amount: number;
}

export interface StkPushResult {
  checkoutRequestId: string;
  merchantRequestId: string;
  amount: number;
  phone: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  description: string;
  receivedAt?: string;
}

export const paymentService = {
  async listForStudent(studentId: string): Promise<Payment[]> {
    return delay(
      mockPayments
        .filter((p) => p.studentId === studentId)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    );
  },

  async summaryForStudent(studentId: string): Promise<StudentPaymentSummary> {
    const student = mockStudents.find((s) => s.id === studentId);
    const room = student?.roomId
      ? mockRooms.find((r) => r.id === student.roomId)
      : undefined;
    const history = mockPayments
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

    const nextDue = history.find((p) => p.status !== "PAID") ?? null;
    return delay({
      currentRent: room?.price ?? 0,
      status: nextDue?.status ?? "PENDING",
      nextDueDate: nextDue?.dueDate ?? null,
      history,
    });
  },

  async createPayment(
    input: Omit<Payment, "id" | "paidAt">,
  ): Promise<Payment> {
    const payment: Payment = {
      ...input,
      id: generateId("p"),
      paidAt: input.status === "PAID" ? new Date().toISOString() : undefined,
    };
    mockPayments.push(payment);
    return delay(payment);
  },

  async sendReminder(studentId: string): Promise<void> {
    void studentId;
    await delay(undefined, 200);
  },

  async stkPush(input: StkPushInput): Promise<StkPushResult> {
    await delay(undefined, 1800);
    const ok = Math.random() > 0.15;
    return {
      checkoutRequestId: `ws_CO_${Date.now().toString(36)}`,
      merchantRequestId: `mr-${Date.now().toString(36)}`,
      amount: input.amount,
      phone: input.phone,
      status: ok ? "SUCCESS" : "FAILED",
      description: `Rent payment — KES ${input.amount}`,
      receivedAt: ok ? new Date().toISOString() : undefined,
    };
  },
};