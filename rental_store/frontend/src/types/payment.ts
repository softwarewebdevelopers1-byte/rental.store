export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE";
export type PaymentMethod = "MPESA" | "CASH" | "BANK" | "CARD";

export interface Payment {
  id: string;
  studentId: string;
  hostelId: string;
  roomId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  method?: PaymentMethod;
  mpesaPhone?: string;
  mpesaCode?: string;
  periodLabel?: string | null;
  recordedById?: string | null;
  recordedByName?: string | null;
  notes?: string | null;
  studentName?: string | null;
  studentEmail?: string | null;
  hostelName?: string | null;
  roomNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentResponse extends Payment {
  reference?: string | null;
}

export interface PaymentSummaryResponse extends Payment {
  periodLabel?: string | null;
  recordedByName?: string | null;
}

export interface PaymentHistoryFilter {
  studentId?: string;
  studentQuery?: string;
  hostelId?: string;
  roomId?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  periodLabel?: string;
  reference?: string;
}

export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface HostelPaymentBreakdown {
  hostelId: string;
  hostelName: string;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  collectedThisMonth: number;
}

export interface LandlordPaymentSummaryResponse {
  totalPaidCount: number;
  totalPendingCount: number;
  totalOverdueCount: number;
  totalCollectedThisMonth: number;
  totalOutstanding: number;
  byHostel: HostelPaymentBreakdown[];
}

export interface PaymentRecordRequest {
  studentId: string;
  amount: number;
  dueDate: string;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
  periodLabel?: string;
}

export interface PaymentBatchRecordRequest {
  payments: Array<{
    studentId: string;
    amount: number;
    dueDate: string;
    method?: PaymentMethod;
    reference?: string;
  }>;
  periodLabel?: string;
}

export interface RecorderSummary {
  caretakerId: string;
  name: string;
  email: string;
}

export interface HostelPaymentRecorderResponse {
  hostelId: string;
  permitted: RecorderSummary[];
  notPermitted: RecorderSummary[];
}
