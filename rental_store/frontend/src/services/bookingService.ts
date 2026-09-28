import { http } from "./apiClient";

export type BookingInitiation = "PAY_NOW" | "CONTACT";
export type BookingRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export interface BookingResponse {
  id: string;
  studentId: string;
  studentName?: string | null;
  studentEmail?: string | null;
  hostelId: string;
  hostelName?: string | null;
  roomId: string;
  roomNumber?: string | null;
  roomPrice: number;
  status: BookingRequestStatus;
  initiation: BookingInitiation;
  moveInDate: string;
  message?: string | null;
  paymentId?: string | null;
  paymentStatus?: "PAID" | "PENDING" | "OVERDUE" | "FAILED" | null;
  decidedAt?: string | null;
  decidedByName?: string | null;
  rejectionReason?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  roomId: string;
  moveInDate: string;
  initiation: BookingInitiation;
  message?: string;
}

export const bookingService = {
  async create(payload: CreateBookingRequest): Promise<BookingResponse> {
    return http.post<BookingResponse>("/bookings", payload);
  },

  async getById(id: string): Promise<BookingResponse> {
    return http.get<BookingResponse>(`/bookings/${id}`);
  },
};
