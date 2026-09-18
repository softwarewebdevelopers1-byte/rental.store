import { mockCaretakers, mockStudents } from "../data/users";
import { mockHostels } from "../data/hostels";
import { mockRooms } from "../data/rooms";
import { mockMaintenance } from "../data/maintenance";
import type { Caretaker, Student } from "../types/user";
import type { Hostel } from "../types/hostel";
import type { Room } from "../types/room";
import type { MaintenanceRequest } from "../types/maintenance";
import { delay } from "../utils/delay";

export interface CaretakerStats {
  assignedHostels: number;
  totalTenants: number;
  openRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
}

export interface TenantWithRoom {
  student: Student;
  room?: Room;
  hostel: Hostel;
}

export const caretakerService = {
  async getCaretaker(caretakerId: string): Promise<Caretaker | null> {
    return delay(mockCaretakers.find((c) => c.id === caretakerId) ?? null);
  },

  async listAssignedHostels(caretakerId: string): Promise<Hostel[]> {
    const caretaker = mockCaretakers.find((c) => c.id === caretakerId);
    if (!caretaker) return delay([]);
    const ids = new Set(caretaker.assignedHostelIds);
    return delay(mockHostels.filter((h) => ids.has(h.id) && h.active));
  },

  async stats(caretakerId: string): Promise<CaretakerStats> {
    const caretaker = mockCaretakers.find((c) => c.id === caretakerId);
    if (!caretaker) {
      return delay({
        assignedHostels: 0,
        totalTenants: 0,
        openRequests: 0,
        inProgressRequests: 0,
        resolvedRequests: 0,
      });
    }
    const hostelIds = new Set(caretaker.assignedHostelIds);
    const tenants = mockStudents.filter(
      (s) =>
        s.hostelId &&
        hostelIds.has(s.hostelId) &&
        s.membershipStatus === "ACTIVE",
    );
    const requests = mockMaintenance.filter((m) => hostelIds.has(m.hostelId));

    return delay({
      assignedHostels: hostelIds.size,
      totalTenants: tenants.length,
      openRequests: requests.filter((r) => r.status === "OPEN").length,
      inProgressRequests: requests.filter((r) => r.status === "IN_PROGRESS")
        .length,
      resolvedRequests: requests.filter(
        (r) => r.status === "RESOLVED" || r.status === "CLOSED",
      ).length,
    });
  },

  async listMaintenance(caretakerId: string): Promise<MaintenanceRequest[]> {
    const caretaker = mockCaretakers.find((c) => c.id === caretakerId);
    if (!caretaker) return delay([]);
    const ids = new Set(caretaker.assignedHostelIds);
    return delay(
      mockMaintenance
        .filter((m) => ids.has(m.hostelId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listTenants(caretakerId: string): Promise<TenantWithRoom[]> {
    const caretaker = mockCaretakers.find((c) => c.id === caretakerId);
    if (!caretaker) return delay([]);
    const ids = new Set(caretaker.assignedHostelIds);
    const hostels = mockHostels.filter((h) => ids.has(h.id));
    const hostelMap = new Map(hostels.map((h) => [h.id, h] as const));

    const tenants = mockStudents.filter(
      (s) =>
        s.hostelId && ids.has(s.hostelId) && s.membershipStatus === "ACTIVE",
    );

    return delay(
      tenants.map((t) => {
        const hostel = hostelMap.get(t.hostelId!);
        const room = t.roomId
          ? mockRooms.find((r) => r.id === t.roomId)
          : undefined;
        return { student: t, room, hostel: hostel! };
      }),
    );
  },

  async updateMaintenanceStatus(
    id: string,
    status: MaintenanceRequest["status"],
  ): Promise<void> {
    const req = mockMaintenance.find((m) => m.id === id);
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();
    }
    await delay(undefined, 200);
  },
};
