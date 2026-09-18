import type { Payment } from "../types/payment";

export const mockPayments: Payment[] = [
  {
    id: "p-1",
    studentId: "u-stu-1",
    hostelId: "h-1",
    roomId: "r-a01",
    amount: 4500,
    status: "PAID",
    dueDate: "2024-03-01T00:00:00Z",
    paidAt: "2024-02-28T10:00:00Z",
    method: "MPESA",
  },
  {
    id: "p-2",
    studentId: "u-stu-1",
    hostelId: "h-1",
    roomId: "r-a01",
    amount: 4500,
    status: "PENDING",
    dueDate: "2024-04-01T00:00:00Z",
  },
  {
    id: "p-3",
    studentId: "u-stu-2",
    hostelId: "h-1",
    roomId: "r-a03",
    amount: 5000,
    status: "OVERDUE",
    dueDate: "2024-03-15T00:00:00Z",
  },
];
