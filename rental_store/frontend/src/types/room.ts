export type RoomStatus = "VACANT" | "HELD" | "BOOKED";
export type BillingPeriod = "MONTHLY" | "SEMESTER" | "TRISEMESTER";

export const billingPeriodLabel: Record<BillingPeriod, string> = {
  MONTHLY: "per month",
  SEMESTER: "per semester",
  TRISEMESTER: "per trisemester",
};

export interface Room {
  id: string;
  hostelId: string;
  number: string;
  price: number;
  billingPeriod: BillingPeriod;
  status: RoomStatus;
  tenantId?: string;
  tenantName?: string;
}
