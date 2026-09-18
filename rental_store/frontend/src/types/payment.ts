export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE";
export type PaymentMethod = "MPESA" | "CASH" | "BANK";

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
}
