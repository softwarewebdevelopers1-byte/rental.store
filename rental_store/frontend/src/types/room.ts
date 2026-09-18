export type RoomStatus = "VACANT" | "BOOKED";

export interface Room {
  id: string;
  hostelId: string;
  number: string;
  price: number;
  status: RoomStatus;
  tenantId?: string;
  tenantName?: string;
}
