import { mockRooms } from "../data/rooms";
import type { Room, RoomStatus } from "../types/room";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export const roomService = {
  async listForHostel(hostelId: string): Promise<Room[]> {
    return delay(
      mockRooms
        .filter((r) => r.hostelId === hostelId)
        .sort((a, b) => a.number.localeCompare(b.number)),
    );
  },

  async create(input: {
    hostelId: string;
    number: string;
    price: number;
  }): Promise<Room> {
    const room: Room = {
      id: generateId("r"),
      hostelId: input.hostelId,
      number: input.number,
      price: input.price,
      status: "VACANT",
    };
    mockRooms.push(room);
    return delay(room);
  },

  async update(id: string, patch: Partial<Room>): Promise<Room | null> {
    const idx = mockRooms.findIndex((r) => r.id === id);
    if (idx < 0) return delay(null);
    mockRooms[idx] = { ...mockRooms[idx], ...patch };
    return delay(mockRooms[idx]);
  },

  async setStatus(id: string, status: RoomStatus): Promise<Room | null> {
    return this.update(id, { status });
  },

  async remove(id: string): Promise<boolean> {
    const idx = mockRooms.findIndex((r) => r.id === id);
    if (idx < 0) return delay(false);
    mockRooms.splice(idx, 1);
    return delay(true);
  },
};
