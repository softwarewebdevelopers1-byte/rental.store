import { mockConflicts } from "../data/conflicts";
import type { Conflict } from "../types/conflict";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export interface CreateConflictInput {
  orderId: string;
  studentId: string;
  agentId: string;
  issue: Conflict["issue"];
  description: string;
}

export const conflictService = {
  async listForStudent(studentId: string): Promise<Conflict[]> {
    return delay(
      mockConflicts
        .filter((c) => c.studentId === studentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listForAgent(agentId: string): Promise<Conflict[]> {
    return delay(
      mockConflicts
        .filter((c) => c.agentId === agentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listAll(): Promise<Conflict[]> {
    return delay(
      [...mockConflicts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async getById(id: string): Promise<Conflict | null> {
    return delay(mockConflicts.find((c) => c.id === id) ?? null);
  },

  async create(input: CreateConflictInput): Promise<Conflict> {
    const conflict: Conflict = {
      ...input,
      id: generateId("cf"),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    mockConflicts.push(conflict);
    return delay(conflict);
  },

  async resolve(id: string, resolution: string): Promise<Conflict | null> {
    const conflict = mockConflicts.find((c) => c.id === id);
    if (!conflict) return delay(null);
    conflict.status = "RESOLVED";
    conflict.resolution = resolution;
    conflict.resolvedAt = new Date().toISOString();
    return delay(conflict);
  },
};
