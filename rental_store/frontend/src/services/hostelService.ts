import { mockHostels } from "../data/hostels";
import { mockRooms } from "../data/rooms";
import { mockUsers } from "../data/users";
import type { Hostel } from "../types/hostel";
import type { Room } from "../types/room";
import type { Landlord, Student } from "../types/user";
import { mockStudents } from "../data/users";
import { mockPayments } from "../data/payments";
import { mockMessages } from "../data/messages";
import { delay } from "../utils/delay";

export interface HostelFilters {
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  vacantOnly?: boolean;
  minRating?: number;
  sortBy?: "price-asc" | "price-desc" | "rating-desc";
}

export interface HostelSummary extends Hostel {
  vacantRooms: number;
  priceRange: [number, number] | null;
  landlordVerified: boolean;
}

export interface LandlordStats {
  totalHostels: number;
  totalRooms: number;
  vacantRooms: number;
  bookedRooms: number;
  activeTenants: number;
  pendingRequests: number;
  outstandingPayments: number;
  unreadMessages: number;
}

export interface PendingStudentRequest {
  student: Student;
  requestedHostelName: string;
}

function toSummary(hostel: Hostel): HostelSummary {
  const rooms = mockRooms.filter((r) => r.hostelId === hostel.id);
  const vacant = rooms.filter((r) => r.status === "VACANT");
  const prices = rooms.map((r) => r.price);
  const landlord = mockUsers.find(
    (u): u is Landlord => u.id === hostel.landlordId && u.role === "LANDLORD",
  );
  return {
    ...hostel,
    vacantRooms: vacant.length,
    priceRange: prices.length
      ? [Math.min(...prices), Math.max(...prices)]
      : null,
    landlordVerified: landlord?.verificationStatus === "APPROVED",
  };
}

export const hostelService = {
  async list(filters: HostelFilters = {}): Promise<HostelSummary[]> {
    let results = mockHostels.filter((h) => h.active).map(toSummary);

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q),
      );
    }
    if (filters.location) {
      const l = filters.location.toLowerCase();
      results = results.filter((h) => h.location.toLowerCase().includes(l));
    }
    if (filters.minPrice != null) {
      results = results.filter(
        (h) => h.priceRange && h.priceRange[0] >= filters.minPrice!,
      );
    }
    if (filters.maxPrice != null) {
      results = results.filter(
        (h) => h.priceRange && h.priceRange[1] <= filters.maxPrice!,
      );
    }
    if (filters.vacantOnly) {
      results = results.filter((h) => h.vacantRooms > 0);
    }
    if (filters.minRating != null) {
      results = results.filter((h) => h.rating >= filters.minRating!);
    }
    if (filters.sortBy === "price-asc") {
      results.sort(
        (a, b) => (a.priceRange?.[0] ?? 0) - (b.priceRange?.[0] ?? 0),
      );
    } else if (filters.sortBy === "price-desc") {
      results.sort(
        (a, b) => (b.priceRange?.[0] ?? 0) - (a.priceRange?.[0] ?? 0),
      );
    } else if (filters.sortBy === "rating-desc") {
      results.sort((a, b) => b.rating - a.rating);
    }

    return delay(results);
  },

  async getById(id: string): Promise<HostelSummary | null> {
    const hostel = mockHostels.find((h) => h.id === id);
    return delay(hostel ? toSummary(hostel) : null);
  },

  async getRooms(hostelId: string): Promise<Room[]> {
    return delay(mockRooms.filter((r) => r.hostelId === hostelId));
  },

  async findByCode(code: string): Promise<Hostel | null> {
    const hostel = mockHostels.find(
      (h) => h.code.toUpperCase() === code.trim().toUpperCase() && h.active,
    );
    return delay(hostel ?? null);
  },

  async listByLandlord(landlordId: string): Promise<HostelSummary[]> {
    const results = mockHostels
      .filter((h) => h.landlordId === landlordId && h.active)
      .map(toSummary);
    return delay(results);
  },

  async statsForLandlord(landlordId: string): Promise<LandlordStats> {
    const hostels = mockHostels.filter(
      (h) => h.landlordId === landlordId && h.active,
    );
    const hostelIds = new Set(hostels.map((h) => h.id));
    const rooms = mockRooms.filter((r) => hostelIds.has(r.hostelId));
    const students = mockStudents.filter(
      (s) => s.hostelId && hostelIds.has(s.hostelId),
    );
    const pendingRequests = mockStudents.filter(
      (s) =>
        s.membershipStatus === "PENDING" &&
        s.requestedHostelId &&
        hostelIds.has(s.requestedHostelId),
    ).length;
    const outstandingPayments = mockPayments.filter(
      (p) =>
        hostelIds.has(p.hostelId) &&
        (p.status === "PENDING" || p.status === "OVERDUE"),
    ).length;
    const unreadMessages = mockMessages.filter(
      (m) => !m.read && m.senderId === landlordId,
    ).length;

    return delay({
      totalHostels: hostels.length,
      totalRooms: rooms.length,
      vacantRooms: rooms.filter((r) => r.status === "VACANT").length,
      bookedRooms: rooms.filter((r) => r.status === "BOOKED").length,
      activeTenants: students.filter((s) => s.membershipStatus === "ACTIVE")
        .length,
      pendingRequests,
      outstandingPayments,
      unreadMessages,
    });
  },

  async listTenants(
    landlordId: string,
    hostelId?: string,
  ): Promise<Student[]> {
    const landlordHostelIds = new Set(
      mockHostels
        .filter((h) => h.landlordId === landlordId && h.active)
        .map((h) => h.id),
    );
    return delay(
      mockStudents.filter(
        (s) =>
          s.membershipStatus === "ACTIVE" &&
          s.hostelId &&
          landlordHostelIds.has(s.hostelId) &&
          (!hostelId || s.hostelId === hostelId),
      ),
    );
  },

  async listPendingRequests(
    landlordId: string,
  ): Promise<PendingStudentRequest[]> {
    const landlordHostels = mockHostels.filter(
      (h) => h.landlordId === landlordId && h.active,
    );
    const byId = new Map(landlordHostels.map((h) => [h.id, h]));
    return delay(
      mockStudents
        .filter(
          (s) =>
            s.membershipStatus === "PENDING" &&
            !!s.requestedHostelId &&
            byId.has(s.requestedHostelId),
        )
        .map((student) => ({
          student,
          requestedHostelName: byId.get(student.requestedHostelId!)!.name,
        })),
    );
  },

  async acceptRequest(studentId: string): Promise<Student | null> {
    const student = mockStudents.find((s) => s.id === studentId);
    if (!student || !student.requestedHostelId) return delay(null);
    student.hostelId = student.requestedHostelId;
    student.membershipStatus = "ACTIVE";
    student.requestedHostelId = undefined;
    return delay(student);
  },

  async rejectRequest(studentId: string): Promise<Student | null> {
    const student = mockStudents.find((s) => s.id === studentId);
    if (!student) return delay(null);
    student.membershipStatus = "REJECTED";
    return delay(student);
  },

  async updateVerification(
    landlordId: string,
    status: Landlord["verificationStatus"],
  ): Promise<Landlord | null> {
    const landlord = mockUsers.find(
      (u): u is Landlord => u.id === landlordId && u.role === "LANDLORD",
    );
    if (!landlord) return delay(null);
    landlord.verificationStatus = status;
    return delay(landlord);
  },

  async create(
    payload: Omit<Hostel, "id" | "createdAt" | "rating" | "reviewCount">,
  ): Promise<Hostel> {
    const hostel: Hostel = {
      ...payload,
      id: `h-${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockHostels.push(hostel);
    return delay(hostel);
  },

  async update(id: string, patch: Partial<Hostel>): Promise<Hostel | null> {
    const idx = mockHostels.findIndex((h) => h.id === id);
    if (idx < 0) return delay(null);
    mockHostels[idx] = { ...mockHostels[idx], ...patch };
    return delay(mockHostels[idx]);
  },

  async remove(id: string): Promise<boolean> {
    const idx = mockHostels.findIndex((h) => h.id === id);
    if (idx < 0) return delay(false);
    mockHostels[idx].active = false;
    return delay(true);
  },
};
