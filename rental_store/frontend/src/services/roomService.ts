import { http } from "./apiClient";
import type { BillingPeriod, Room, RoomStatus } from "../types/room";

interface RoomResponse {
  id: string;
  hostelId: string;
  number: string;
  price: number;
  billingPeriod: BillingPeriod;
  status: RoomStatus;
  tenantId: string | null;
  tenantName: string | null;
}

function toRoom(raw: RoomResponse): Room {
  return {
    ...raw,
    tenantId: raw.tenantId ?? undefined,
    tenantName: raw.tenantName ?? undefined,
  };
}

export const roomService = {
  async listForHostel(hostelId: string): Promise<Room[]> {
    const rooms = await http.get<RoomResponse[]>(`/rooms/hostel/${hostelId}`);
    return rooms.map(toRoom);
  },

  async create(input: {
    hostelId: string;
    number: string;
    price: number;
    billingPeriod: BillingPeriod;
  }): Promise<Room> {
    const room = await http.post<RoomResponse>(`/rooms/hostel/${input.hostelId}`, {
      number: input.number,
      price: input.price,
      billingPeriod: input.billingPeriod,
    });
    return toRoom(room);
  },

  async update(id: string, patch: Partial<Room>): Promise<Room | null> {
    const room = await http.patch<RoomResponse>(`/rooms/${id}`, patch);
    return toRoom(room);
  },

  async setStatus(id: string, status: RoomStatus): Promise<Room | null> {
    const room = await http.patch<RoomResponse>(`/rooms/${id}/status`, { status });
    return toRoom(room);
  },

  async remove(id: string): Promise<boolean> {
    await http.delete<void>(`/rooms/${id}`);
    return true;
  },
};
