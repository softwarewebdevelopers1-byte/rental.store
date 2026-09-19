import { http } from "./apiClient";
import type { Conflict } from "../types/conflict";

export interface CreateConflictInput {
  orderId: string;
  studentId: string;
  agentId: string;
  issue: Conflict["issue"];
  description: string;
}

interface Page<T> {
  content: T[];
}

interface ConflictSummaryResponse {
  id: string;
  orderId: string;
  issue: Conflict["issue"];
  status: Conflict["status"];
  studentId: string;
  agentId: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface ConflictResponse extends ConflictSummaryResponse {
  description: string;
  resolution: string | null;
}

function toConflict(raw: ConflictResponse): Conflict {
  return {
    id: raw.id,
    orderId: raw.orderId,
    studentId: raw.studentId,
    agentId: raw.agentId,
    issue: raw.issue,
    description: raw.description,
    status: raw.status,
    ...(raw.resolution ? { resolution: raw.resolution } : {}),
    createdAt: raw.createdAt,
    ...(raw.resolvedAt ? { resolvedAt: raw.resolvedAt } : {}),
  };
}

function toSummary(raw: ConflictSummaryResponse): Conflict {
  return {
    id: raw.id,
    orderId: raw.orderId,
    studentId: raw.studentId,
    agentId: raw.agentId,
    issue: raw.issue,
    description: "",
    status: raw.status,
    createdAt: raw.createdAt,
    ...(raw.resolvedAt ? { resolvedAt: raw.resolvedAt } : {}),
  };
}

async function list(path: string): Promise<Conflict[]> {
  const page = await http.get<Page<ConflictSummaryResponse>>(path);
  return page.content.map(toSummary);
}

export const conflictService = {
  async listForStudent(studentId: string): Promise<Conflict[]> {
    void studentId;
    return list("/conflicts/me");
  },

  async listForAgent(agentId: string): Promise<Conflict[]> {
    void agentId;
    return list("/conflicts/agent");
  },

  async listAll(): Promise<Conflict[]> {
    return list("/conflicts/admin");
  },

  async getById(id: string): Promise<Conflict | null> {
    return toConflict(await http.get<ConflictResponse>(`/conflicts/${id}`));
  },

  async create(input: CreateConflictInput): Promise<Conflict> {
    void input.studentId;
    void input.agentId;
    const raw = await http.post<ConflictResponse>(
      `/conflicts/me/orders/${input.orderId}`,
      { issue: input.issue, description: input.description, attachments: [] },
    );
    return toConflict(raw);
  },

  async resolve(id: string, resolution: string): Promise<Conflict | null> {
    const raw = await http.post<ConflictResponse>(`/conflicts/${id}/resolve`, {
      decision: "RESOLVED",
      resolution,
    });
    return toConflict(raw);
  },
};
