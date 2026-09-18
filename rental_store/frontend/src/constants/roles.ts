import type { UserRole } from "../types/user";

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  LANDLORD: "Landlord",
  CARETAKER: "Caretaker",
  MARKET_AGENT: "Market Agent",
  ADMIN: "Admin",
};

export const ROLE_HOME: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  LANDLORD: "/landlord/dashboard",
  CARETAKER: "/caretaker/dashboard",
  MARKET_AGENT: "/agent/dashboard",
  ADMIN: "/admin/dashboard",
};
