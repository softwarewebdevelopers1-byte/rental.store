import { http } from "./apiClient";
import type { Hostel } from "../types/hostel";
import type { Room } from "../types/room";
import type { Caretaker, Landlord, Student } from "../types/user";

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
  caretakers?: Caretaker[];
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

interface Page<T> {
  content: T[];
}

interface RoomSummary {
  id: string;
  hostelId: string;
  number: string;
  price: number;
  status: Room["status"];
  tenantId: string | null;
  tenantName: string | null;
}

interface HostelSummaryResponse {
  id: string;
  name: string;
  code: string;
  location: string;
  mainImage: string | null;
  rating: number;
  reviewCount: number;
  vacantRooms: number;
  totalRooms: number;
  minPrice: number | null;
  maxPrice: number | null;
  landlordVerified: boolean;
  landlordId: string;
  landlordName: string;
  createdAt: string;
}

interface HostelResponse extends HostelSummaryResponse {
  description: string | null;
  images: string[];
  active: boolean;
  bookedRooms: number;
  rooms: Array<{
    id: string;
    number: string;
    price: number;
    status: Room["status"] | string;
    tenantId: string | null;
    tenantName: string | null;
  }>;
  caretakers: Array<{ id: string; name: string; email: string }>;
  updatedAt: string;
}

interface StudentSummaryResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  active: boolean;
  membershipStatus: Student["membershipStatus"];
  hostelId: string | null;
  roomId: string | null;
  requestedHostelId: string | null;
  createdAt: string;
}

interface PendingRequestResponse {
  studentId: string;
  studentName: string;
  studentEmail: string;
  requestedHostelId: string;
  requestedHostelName: string;
  requestedAt: string;
}

function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const result = search.toString();
  return result ? `?${result}` : "";
}

function toHostelSummary(raw: HostelSummaryResponse): HostelSummary {
  return {
    id: raw.id,
    landlordId: raw.landlordId,
    name: raw.name,
    code: raw.code,
    location: raw.location,
    images: raw.mainImage ? [raw.mainImage] : [],
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    active: true,
    createdAt: raw.createdAt,
    vacantRooms: raw.vacantRooms,
    priceRange:
      raw.minPrice != null && raw.maxPrice != null
        ? [raw.minPrice, raw.maxPrice]
        : null,
    landlordVerified: raw.landlordVerified,
  };
}

function toHostel(raw: HostelResponse): HostelSummary {
  return {
    ...toHostelSummary(raw),
    description: raw.description ?? undefined,
    images: raw.images ?? [],
    active: raw.active,
    caretakers: raw.caretakers.map((caretaker) => ({
      id: caretaker.id,
      name: caretaker.name,
      email: caretaker.email,
      role: "CARETAKER",
      active: true,
      assignedHostelIds: [raw.id],
      createdAt: raw.createdAt,
    })),
  };
}

function toRoom(raw: RoomSummary): Room {
  return {
    ...raw,
    tenantId: raw.tenantId ?? undefined,
    tenantName: raw.tenantName ?? undefined,
  };
}

function toStudent(raw: StudentSummaryResponse): Student {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? undefined,
    avatarUrl: raw.avatarUrl ?? undefined,
    role: "STUDENT",
    active: raw.active,
    createdAt: raw.createdAt,
    membershipStatus: raw.membershipStatus,
    ...(raw.hostelId ? { hostelId: raw.hostelId } : {}),
    ...(raw.roomId ? { roomId: raw.roomId } : {}),
    ...(raw.requestedHostelId ? { requestedHostelId: raw.requestedHostelId } : {}),
  };
}

export const hostelService = {
  async list(filters: HostelFilters = {}): Promise<HostelSummary[]> {
    const sortBy =
      filters.sortBy === "price-asc"
        ? "PRICE_ASC"
        : filters.sortBy === "price-desc"
          ? "PRICE_DESC"
          : filters.sortBy === "rating-desc"
            ? "RATING_DESC"
            : undefined;
    const page = await http.get<Page<HostelSummaryResponse>>(
      `/hostels${queryString({
        q: filters.query,
        location: filters.location,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        vacantOnly: filters.vacantOnly,
        minRating: filters.minRating,
        sortBy,
      })}`,
    );
    return page.content.map(toHostelSummary);
  },

  async getById(id: string): Promise<HostelSummary | null> {
    return toHostel(await http.get<HostelResponse>(`/hostels/${id}`));
  },

  async getRooms(hostelId: string): Promise<Room[]> {
    const rooms = await http.get<RoomSummary[]>(`/hostels/${hostelId}/rooms`);
    return rooms.map(toRoom);
  },

  async bookRoom(
    roomId: string,
    hostelId: string,
    tenantId: string,
    tenantName: string,
  ): Promise<Room | null> {
    void roomId;
    void hostelId;
    void tenantId;
    void tenantName;
    throw new Error("Room booking is not exposed by the backend service layer");
  },

  async findByCode(code: string): Promise<Hostel | null> {
    const raw = await http.get<HostelSummaryResponse>(
      `/hostels/code/${encodeURIComponent(code.trim())}`,
    );
    return toHostelSummary(raw);
  },

  async listByLandlord(landlordId: string): Promise<HostelSummary[]> {
    void landlordId;
    const page = await http.get<Page<HostelSummaryResponse>>("/hostels/me");
    return page.content.map(toHostelSummary);
  },

  async statsForLandlord(landlordId: string): Promise<LandlordStats> {
    void landlordId;
    return http.get<LandlordStats>("/landlords/me/stats");
  },

  async listTenants(landlordId: string, hostelId?: string): Promise<Student[]> {
    void landlordId;
    if (hostelId) {
      const page = await http.get<Page<StudentSummaryResponse>>(
        `/hostels/${hostelId}/tenants`,
      );
      return page.content.map(toStudent);
    }
    const hostels = await http.get<Page<HostelSummaryResponse>>("/hostels/me");
    const pages = await Promise.all(
      hostels.content.map((hostel) =>
        http.get<Page<StudentSummaryResponse>>(`/hostels/${hostel.id}/tenants`),
      ),
    );
    return pages.flatMap((page) => page.content.map(toStudent));
  },

  async listPendingRequests(landlordId: string): Promise<PendingStudentRequest[]> {
    void landlordId;
    const hostels = await http.get<Page<HostelSummaryResponse>>("/hostels/me");
    const requests = await Promise.all(
      hostels.content.map((hostel) =>
        http.get<PendingRequestResponse[]>(`/hostels/${hostel.id}/pending-requests`),
      ),
    );
    return requests.flat().map((raw) => ({
      student: {
        id: raw.studentId,
        name: raw.studentName,
        email: raw.studentEmail,
        role: "STUDENT" as const,
        active: true,
        createdAt: raw.requestedAt,
        membershipStatus: "PENDING" as const,
        requestedHostelId: raw.requestedHostelId,
      },
      requestedHostelName: raw.requestedHostelName,
    }));
  },

  async acceptRequest(studentId: string): Promise<Student | null> {
    const request = (await this.listPendingRequests("")).find(
      (item) => item.student.id === studentId,
    );
    if (!request?.student.requestedHostelId) return null;
    await http.post<void>(
      `/hostels/${request.student.requestedHostelId}/requests/${studentId}/accept`,
    );
    return {
      ...request.student,
      hostelId: request.student.requestedHostelId,
      membershipStatus: "ACTIVE",
      requestedHostelId: undefined,
    };
  },

  async rejectRequest(studentId: string): Promise<Student | null> {
    const request = (await this.listPendingRequests("")).find(
      (item) => item.student.id === studentId,
    );
    if (!request?.student.requestedHostelId) return null;
    await http.post<void>(
      `/hostels/${request.student.requestedHostelId}/requests/${studentId}/reject`,
    );
    return { ...request.student, membershipStatus: "REJECTED" };
  },

  async updateVerification(
    landlordId: string,
    status: Landlord["verificationStatus"],
  ): Promise<Landlord | null> {
    const path = status === "PENDING"
      ? "/landlords/me/verification/request"
      : `/admin/landlords/${landlordId}/verification`;
    const raw = await http.post<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      avatarUrl: string | null;
      active: boolean;
      verificationStatus: Landlord["verificationStatus"];
      hostels: Array<{ id?: string }> | null;
      createdAt: string;
    }>(path, status === "PENDING" ? undefined : { decision: status });
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone ?? undefined,
      avatarUrl: raw.avatarUrl ?? undefined,
      role: "LANDLORD",
      active: raw.active,
      createdAt: raw.createdAt,
      verificationStatus: raw.verificationStatus,
      hostelIds: raw.hostels?.flatMap((hostel) => (hostel.id ? [hostel.id] : [])) ?? [],
    };
  },

  async create(
    payload: Omit<Hostel, "id" | "createdAt" | "rating" | "reviewCount">,
  ): Promise<Hostel> {
    const raw = await http.post<HostelResponse>("/hostels", {
      name: payload.name,
      code: payload.code,
      location: payload.location,
      description: payload.description,
      images: payload.images,
    });
    return toHostel(raw);
  },

  async update(id: string, patch: Partial<Hostel>): Promise<Hostel | null> {
    const raw = await http.patch<HostelResponse>(`/hostels/${id}`, patch);
    return toHostel(raw);
  },

  async remove(id: string): Promise<boolean> {
    await http.delete<void>(`/hostels/${id}`);
    return true;
  },
};
