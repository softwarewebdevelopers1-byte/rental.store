import type { Room } from "../types/room";

export const mockRooms: Room[] = [
  {
    id: "r-a01",
    hostelId: "h-1",
    number: "A01",
    price: 4500,
    status: "BOOKED",
    tenantId: "u-stu-1",
    tenantName: "John Mwangi",
  },
  {
    id: "r-a02",
    hostelId: "h-1",
    number: "A02",
    price: 4500,
    status: "VACANT",
  },
  {
    id: "r-a03",
    hostelId: "h-1",
    number: "A03",
    price: 5000,
    status: "BOOKED",
    tenantId: "u-stu-2",
    tenantName: "Mary Wanjiku",
  },
  {
    id: "r-a04",
    hostelId: "h-1",
    number: "A04",
    price: 5000,
    status: "VACANT",
  },
  {
    id: "r-b01",
    hostelId: "h-2",
    number: "B01",
    price: 4000,
    status: "VACANT",
  },
  {
    id: "r-b02",
    hostelId: "h-2",
    number: "B02",
    price: 4000,
    status: "VACANT",
  },
  {
    id: "r-b03",
    hostelId: "h-2",
    number: "B03",
    price: 4200,
    status: "VACANT",
  },
  {
    id: "r-c01",
    hostelId: "h-3",
    number: "C01",
    price: 6000,
    status: "VACANT",
  },
];
