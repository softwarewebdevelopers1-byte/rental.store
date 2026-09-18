import type {
  Student,
  Landlord,
  Caretaker,
  MarketAgent,
  Admin,
  User,
} from "../types/user";

export const mockStudents: Student[] = [
  {
    id: "u-stu-1",
    name: "John Mwangi",
    email: "student@example.com",
    role: "STUDENT",
    active: true,
    createdAt: "2024-01-10T09:00:00Z",
    hostelId: "h-1",
    roomId: "r-a01",
    membershipStatus: "ACTIVE",
  },
  {
    id: "u-stu-2",
    name: "Mary Wanjiku",
    email: "mary@example.com",
    role: "STUDENT",
    active: true,
    createdAt: "2024-02-01T11:00:00Z",
    hostelId: "h-1",
    roomId: "r-a03",
    membershipStatus: "ACTIVE",
  },
  {
    id: "u-stu-3",
    name: "Peter Otieno",
    email: "peter@example.com",
    role: "STUDENT",
    active: true,
    createdAt: "2024-03-05T13:00:00Z",
    membershipStatus: "PENDING",
    requestedHostelId: "h-2",
  },
];

export const mockLandlords: Landlord[] = [
  {
    id: "u-ll-1",
    name: "Alice Kamau",
    email: "landlord@example.com",
    role: "LANDLORD",
    active: true,
    createdAt: "2023-11-15T08:00:00Z",
    verificationStatus: "APPROVED",
    hostelIds: ["h-1", "h-2"],
  },
];

export const mockCaretakers: Caretaker[] = [
  {
    id: "u-ct-1",
    name: "Grace Njeri",
    email: "caretaker@example.com",
    role: "CARETAKER",
    active: true,
    createdAt: "2023-12-01T08:00:00Z",
    assignedHostelIds: ["h-1"],
  },
];

export const mockAgents: MarketAgent[] = [
  {
    id: "u-ag-1",
    name: "Brian Kiptoo",
    email: "agent@example.com",
    role: "MARKET_AGENT",
    active: true,
    createdAt: "2024-01-01T08:00:00Z",
  },
];

export const mockAdmins: Admin[] = [
  {
    id: "u-ad-1",
    name: "System Admin",
    email: "admin@example.com",
    role: "ADMIN",
    active: true,
    createdAt: "2023-01-01T08:00:00Z",
  },
];

export const mockUsers: User[] = [
  ...mockStudents,
  ...mockLandlords,
  ...mockCaretakers,
  ...mockAgents,
  ...mockAdmins,
];
