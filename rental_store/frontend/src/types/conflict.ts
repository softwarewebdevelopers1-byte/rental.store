export type ConflictIssue =
  "WRONG_ITEM" | "DAMAGED_ITEM" | "MISSING_ITEM" | "POOR_CONDITION" | "OTHER";

export type ConflictStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

export interface Conflict {
  id: string;
  orderId: string;
  studentId: string;
  agentId: string;
  issue: ConflictIssue;
  description: string;
  status: ConflictStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}
