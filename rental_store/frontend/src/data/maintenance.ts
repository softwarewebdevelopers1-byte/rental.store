import type { MaintenanceRequest } from "../types/maintenance";

export const mockMaintenance: MaintenanceRequest[] = [
  {
    id: "mt-1",
    studentId: "u-stu-1",
    hostelId: "h-1",
    roomId: "r-a01",
    title: "Leaking tap",
    description: "The bathroom tap has been leaking since Monday.",
    category: "PLUMBING",
    status: "IN_PROGRESS",
    attachments: [],
    createdAt: "2024-03-18T07:00:00Z",
    updatedAt: "2024-03-19T08:30:00Z",
  },
];
