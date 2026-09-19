import { http } from "./apiClient";
import type { Hostel } from "../types/hostel";
import type { MaintenanceRequest } from "../types/maintenance";
import type { Room } from "../types/room";
import type { Caretaker, Student } from "../types/user";

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

interface HostelSummaryResponse {
  id: string;
  name: string;
  code: string;
  location: string;
  mainImage: string | null;
  rating: number;
  reviewCount: number;
  landlordId: string;
  createdAt: string;
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
  hostelName: string | null;
  roomNumber: string | null;
  createdAt: string;
}

interface CaretakerResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  active: boolean;
  assignedHostelIds: string[];
  createdAt: string;
}

interface MaintenanceSummaryResponse {
  id: string;
  title: string;
  category: MaintenanceRequest["category"];
  status: MaintenanceRequest["status"];
  studentId: string;
  hostelId: string;
  createdAt: string;
  updatedAt: string;
}

interface Page<T> {
  content: T[];
}

function toHostel(raw: HostelSummaryResponse): Hostel {
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
  };
}

function toCaretaker(raw: CaretakerResponse): Caretaker {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? undefined,
    avatarUrl: raw.avatarUrl ?? undefined,
    role: "CARETAKER",
    active: raw.active,
    assignedHostelIds: raw.assignedHostelIds,
    createdAt: raw.createdAt,
  };
}

function toMaintenance(raw: MaintenanceSummaryResponse): MaintenanceRequest {
  return {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    status: raw.status,
    studentId: raw.studentId,
    hostelId: raw.hostelId,
    roomId: "",
    description: "",
    attachments: [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const caretakerService = {
  async getCaretaker(caretakerId: string): Promise<Caretaker | null> {
    void caretakerId;
    return toCaretaker(await http.get<CaretakerResponse>("/caretakers/me"));
  },

  async listAssignedHostels(caretakerId: string): Promise<Hostel[]> {
    void caretakerId;
    const hostels = await http.get<HostelSummaryResponse[]>("/caretakers/me/hostels");
    return hostels.map(toHostel);
  },

  async stats(caretakerId: string): Promise<CaretakerStats> {
    void caretakerId;
    return http.get<CaretakerStats>("/caretakers/me/stats");
  },

  async listMaintenance(caretakerId: string): Promise<MaintenanceRequest[]> {
    void caretakerId;
    const hostels = await http.get<HostelSummaryResponse[]>("/caretakers/me/hostels");
    const requests = await Promise.all(
      hostels.map((hostel) =>
        http.get<MaintenanceSummaryResponse[]>(`/maintenance/hostel/${hostel.id}`),
      ),
    );
    return requests.flat().map(toMaintenance);
  },

  async listTenants(caretakerId: string): Promise<TenantWithRoom[]> {
    void caretakerId;
    const page = await http.get<Page<StudentSummaryResponse>>("/caretakers/me/tenants");
    return page.content.map((raw) => ({
      student: toStudent(raw),
      hostel: {
        id: raw.hostelId ?? "",
        landlordId: "",
        name: raw.hostelName ?? "",
        code: "",
        location: "",
        images: [],
        rating: 0,
        reviewCount: 0,
        active: true,
        createdAt: raw.createdAt,
      },
    }));
  },

  async updateMaintenanceStatus(
    id: string,
    status: MaintenanceRequest["status"],
  ): Promise<void> {
    await http.patch(`/maintenance/${id}/status`, { status });
  },
};
