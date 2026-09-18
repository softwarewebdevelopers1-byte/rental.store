export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE";

export interface Payment {
  id: string;
  studentId: string;
  hostelId: string;
  roomId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  method?: "MPESA" | "CASH" | "BANK";
}
