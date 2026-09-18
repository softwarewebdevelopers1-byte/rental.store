import { mockMaintenance } from "../data/maintenance";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
} from "../types/maintenance";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export const maintenanceService = {
  async listForStudent(studentId: string): Promise<MaintenanceRequest[]> {
    return delay(
      mockMaintenance
        .filter((m) => m.studentId === studentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listForHostel(hostelId: string): Promise<MaintenanceRequest[]> {
    return delay(
      mockMaintenance
        .filter((m) => m.hostelId === hostelId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async create(
    input: Omit<
      MaintenanceRequest,
      "id" | "createdAt" | "updatedAt" | "status"
    >,
  ): Promise<MaintenanceRequest> {
    const now = new Date().toISOString();
    const req: MaintenanceRequest = {
      ...input,
      id: generateId("mt"),
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    };
    mockMaintenance.push(req);
    return delay(req);
  },

  async updateStatus(
    id: string,
    status: MaintenanceStatus,
  ): Promise<MaintenanceRequest | null> {
    const req = mockMaintenance.find((m) => m.id === id);
    if (!req) return delay(null);
    req.status = status;
    req.updatedAt = new Date().toISOString();
    return delay(req);
  },
};
