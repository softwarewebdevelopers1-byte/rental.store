export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type MaintenanceCategory =
  "PLUMBING" | "ELECTRICAL" | "WIFI" | "FURNITURE" | "CLEANING" | "OTHER";

export interface MaintenanceRequest {
  id: string;
  studentId: string;
  hostelId: string;
  roomId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}
