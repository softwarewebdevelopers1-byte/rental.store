import { http } from "./apiClient";
import type {
  LandlordPaymentSummaryResponse,
  Page,
  Payment,
  PaymentBatchRecordRequest,
  PaymentHistoryFilter,
  PaymentRecordRequest,
  PaymentResponse,
  PaymentSummaryResponse,
  HostelPaymentRecorderResponse,
} from "../types/payment";

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

interface RawPayment {
  id: string;
  studentId: string;
  studentName?: string | null;
  studentEmail?: string | null;
  hostelId: string;
  hostelName?: string | null;
  roomId: string | null;
  roomNumber?: string | null;
  amount: number;
  status: Payment["status"];
  dueDate: string;
  paidAt: string | null;
  method: Payment["method"] | null;
  reference?: string | null;
  notes?: string | null;
  periodLabel?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface StudentSummaryRaw {
  currentRent: number;
  currentStatus: Payment["status"];
  nextDueDate: string | null;
  history: RawPayment[];
}

function toPayment(raw: RawPayment): Payment {
  return {
    id: raw.id,
    studentId: raw.studentId,
    hostelId: raw.hostelId,
    roomId: raw.roomId ?? "",
    amount: raw.amount,
    status: raw.status,
    dueDate: raw.dueDate,
    paidAt: raw.paidAt ?? undefined,
    method: raw.method ?? undefined,
    mpesaCode: raw.reference ?? undefined,
    studentName: raw.studentName,
    studentEmail: raw.studentEmail,
    hostelName: raw.hostelName,
    roomNumber: raw.roomNumber,
    periodLabel: raw.periodLabel,
    recordedById: raw.recordedById,
    recordedByName: raw.recordedByName,
    notes: raw.notes,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toResponse(raw: RawPayment): PaymentResponse {
  return { ...toPayment(raw), reference: raw.reference };
}

function queryString(
  filter: PaymentHistoryFilter,
  pageable: { page?: number; size?: number },
): string {
  const params = new URLSearchParams();
  Object.entries({ ...filter, ...pageable }).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function toPage(raw: Page<RawPayment>): Page<PaymentSummaryResponse> {
  return { ...raw, content: raw.content.map(toPayment) };
}

export const paymentService = {
  async listForHostel(hostelId: string): Promise<Payment[]> {
    const page = await http.get<Page<RawPayment>>(`/payments/hostel/${hostelId}`);
    return page.content.map(toPayment);
  },

  async listForStudent(studentId: string): Promise<Payment[]> {
    const page = await http.get<Page<RawPayment>>(`/payments/students/${studentId}`);
    return page.content.map(toPayment);
  },

  async summaryForStudent(studentId: string): Promise<StudentPaymentSummary> {
    void studentId;
    const raw = await http.get<StudentSummaryRaw>("/payments/me/summary");
    return {
      currentRent: raw.currentRent,
      status: raw.currentStatus,
      nextDueDate: raw.nextDueDate,
      history: raw.history.map(toPayment),
    };
  },

  async createPayment(input: Omit<Payment, "id" | "paidAt">): Promise<Payment> {
    const raw = await http.post<RawPayment>("/payments/me", {
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

  async recordLandlordPayment(payload: PaymentRecordRequest): Promise<PaymentResponse> {
    return toResponse(await http.post<RawPayment>("/landlords/me/payments", payload));
  },

  async recordCaretakerPayment(payload: PaymentRecordRequest): Promise<PaymentResponse> {
    return toResponse(await http.post<RawPayment>("/caretakers/me/payments", payload));
  },

  async recordBatch(payload: PaymentBatchRecordRequest): Promise<PaymentSummaryResponse[]> {
    const raw = await http.post<RawPayment[]>("/landlords/me/payments/batch", payload);
    return raw.map(toPayment);
  },

  async searchLandlordPayments(
    filter: PaymentHistoryFilter,
    pageable: { page?: number; size?: number } = {},
  ): Promise<Page<PaymentSummaryResponse>> {
    const raw = await http.get<Page<RawPayment>>(
      `/landlords/me/payments${queryString(filter, pageable)}`,
    );
    return toPage(raw);
  },

  async searchCaretakerPayments(
    filter: PaymentHistoryFilter,
    pageable: { page?: number; size?: number } = {},
  ): Promise<Page<PaymentSummaryResponse>> {
    const raw = await http.get<Page<RawPayment>>(
      `/caretakers/me/payments${queryString(filter, pageable)}`,
    );
    return toPage(raw);
  },

  async landlordSummary(): Promise<LandlordPaymentSummaryResponse> {
    return http.get<LandlordPaymentSummaryResponse>("/landlords/me/payments/summary");
  },

  async caretakerSummary(): Promise<LandlordPaymentSummaryResponse> {
    return http.get<LandlordPaymentSummaryResponse>("/caretakers/me/payments/summary");
  },

  async listHostelPaymentRecorders(hostelId: string): Promise<HostelPaymentRecorderResponse> {
    return http.get<HostelPaymentRecorderResponse>(
      `/landlords/me/hostels/${hostelId}/payment-recorders`,
    );
  },

  async setHostelPaymentRecorder(
    hostelId: string,
    caretakerId: string,
    allowed: boolean,
  ): Promise<HostelPaymentRecorderResponse> {
    return http.patch<HostelPaymentRecorderResponse>(
      `/landlords/me/hostels/${hostelId}/payment-recorders`,
      { caretakerId, allowed },
    );
  },
};
