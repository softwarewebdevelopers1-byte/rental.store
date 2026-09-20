export type UserRole =
  "STUDENT" | "LANDLORD" | "CARETAKER" | "MARKET_AGENT" | "ADMIN";

export type MembershipStatus = "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";

export type VerificationStatus =
  "NOT_REQUESTED" | "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface Student extends User {
  role: "STUDENT";
  hostelId?: string;
  hostelName?: string;
  hostelLocation?: string;
  roomNumber?: string;
  roomPrice?: number;
  roomId?: string;
  membershipStatus: MembershipStatus;
  requestedHostelId?: string;
  requestedHostelName?: string;
}

export interface Landlord extends User {
  role: "LANDLORD";
  verificationStatus: VerificationStatus;
  hostelIds: string[];
}

export interface Caretaker extends User {
  role: "CARETAKER";
  assignedHostelIds: string[];
}

export interface MarketAgent extends User {
  role: "MARKET_AGENT";
}

export interface Admin extends User {
  role: "ADMIN";
}

export interface AuthSession {
  user: User;
  token: string;
}
