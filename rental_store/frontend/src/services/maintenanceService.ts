import { http } from "./apiClient";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
} from "../types/maintenance";

interface MaintenanceSummaryResponse {
  id: string;
  title: string;
  category: MaintenanceRequest["category"];
  status: MaintenanceStatus;
  studentId: string;
  hostelId: string;
  roomNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceResponse extends MaintenanceSummaryResponse {
  description: string;
  roomId: string | null;
  attachments: string[];
}

function toMaintenance(raw: MaintenanceResponse): MaintenanceRequest {
  return {
    id: raw.id,
    studentId: raw.studentId,
    hostelId: raw.hostelId,
    roomId: raw.roomId ?? "",
    title: raw.title,
    description: raw.description,
    category: raw.category,
    status: raw.status,
    attachments: raw.attachments ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toSummary(raw: MaintenanceSummaryResponse): MaintenanceRequest {
  return {
    id: raw.id,
    studentId: raw.studentId,
    hostelId: raw.hostelId,
    roomId: "",
    title: raw.title,
    description: "",
    category: raw.category,
    status: raw.status,
    attachments: [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const maintenanceService = {
  async listForStudent(studentId: string): Promise<MaintenanceRequest[]> {
    void studentId;
    const items = await http.get<MaintenanceSummaryResponse[]>("/maintenance/me");
    return items.map(toSummary);
  },

  async listForHostel(hostelId: string): Promise<MaintenanceRequest[]> {
    const items = await http.get<MaintenanceSummaryResponse[]>(
      `/maintenance/hostel/${hostelId}`,
    );
    return items.map(toSummary);
  },

  async create(
    input: Omit<
      MaintenanceRequest,
      "id" | "createdAt" | "updatedAt" | "status"
    >,
  ): Promise<MaintenanceRequest> {
    const raw = await http.post<MaintenanceResponse>("/maintenance/me", {
      title: input.title,
      description: input.description,
      category: input.category,
      attachments: input.attachments,
    });
    return toMaintenance(raw);
  },

  async updateStatus(
    id: string,
    status: MaintenanceStatus,
  ): Promise<MaintenanceRequest | null> {
    const raw = await http.patch<MaintenanceResponse>(`/maintenance/${id}/status`, {
      status,
    });
    return toMaintenance(raw);
  },
};
