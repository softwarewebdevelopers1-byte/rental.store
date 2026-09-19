import { http } from "./apiClient";
import type { Payment } from "../types/payment";

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

interface Page<T> {
  content: T[];
}

interface PaymentResponse {
  id: string;
  studentId: string;
  hostelId: string;
  roomId: string;
  amount: number;
  status: Payment["status"];
  dueDate: string;
  paidAt: string | null;
  method: Payment["method"] | null;
  reference: string | null;
}

interface StudentPaymentSummaryResponse {
  currentRent: number;
  currentStatus: Payment["status"];
  nextDueDate: string | null;
  history: PaymentResponse[];
}

function toPayment(raw: PaymentResponse): Payment {
  return {
    id: raw.id,
    studentId: raw.studentId,
    hostelId: raw.hostelId,
    roomId: raw.roomId,
    amount: raw.amount,
    status: raw.status,
    dueDate: raw.dueDate,
    ...(raw.paidAt ? { paidAt: raw.paidAt } : {}),
    ...(raw.method ? { method: raw.method } : {}),
    ...(raw.reference ? { mpesaCode: raw.reference } : {}),
  };
}

interface PaymentSummaryResponse {
  id: string;
  studentId: string;
  studentName: string;
  hostelId: string;
  hostelName: string;
  roomId: string;
  roomNumber: string;
  amount: number;
  status: Payment["status"];
  dueDate: string;
  paidAt: string | null;
  method: Payment["method"] | null;
}

function toPaymentFromSummary(raw: PaymentSummaryResponse): Payment {
  return {
    id: raw.id,
    studentId: raw.studentId,
    hostelId: raw.hostelId,
    roomId: raw.roomId,
    amount: raw.amount,
    status: raw.status,
    dueDate: raw.dueDate,
    ...(raw.paidAt ? { paidAt: raw.paidAt } : {}),
    ...(raw.method ? { method: raw.method } : {}),
  };
}

export const paymentService = {
  async listForHostel(hostelId: string): Promise<Payment[]> {
    const page = await http.get<Page<PaymentSummaryResponse>>(
      `/payments/hostel/${hostelId}`,
    );
    return page.content.map(toPaymentFromSummary);
  },

  async listForStudent(studentId: string): Promise<Payment[]> {
    const page = await http.get<Page<PaymentResponse>>(
      `/payments/students/${studentId}`,
    );
    return page.content.map(toPayment);
  },

  async summaryForStudent(studentId: string): Promise<StudentPaymentSummary> {
    void studentId;
    const raw = await http.get<StudentPaymentSummaryResponse>("/payments/me/summary");
    return {
      currentRent: raw.currentRent,
      status: raw.currentStatus,
      nextDueDate: raw.nextDueDate,
      history: raw.history.map(toPayment),
    };
  },

  async createPayment(input: Omit<Payment, "id" | "paidAt">): Promise<Payment> {
    void input.studentId;
    void input.hostelId;
    void input.roomId;
    const raw = await http.post<PaymentResponse>("/payments/me", {
      amount: input.amount,
      dueDate: input.dueDate.slice(0, 10),
      method: input.method,
      reference: input.mpesaCode,
    });
    return toPayment(raw);
  },

  async sendReminder(studentId: string): Promise<void> {
    await http.post<void>("/payments/reminders", { studentIds: [studentId] });
  },

  async stkPush(input: StkPushInput): Promise<StkPushResult> {
    void input;
    throw new Error("STK push is not exposed by the backend service layer");
  },
};
