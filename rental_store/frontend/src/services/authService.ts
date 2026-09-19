import { http } from "./apiClient";
import type { AuthSession, Student, User, UserRole } from "../types/user";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  hostelCode?: string;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

interface LoginResponse {
  token: string;
  user: BackendUser;
}

interface StudentResponse extends BackendUser {
  role: "STUDENT";
  membershipStatus: Student["membershipStatus"];
  hostelId: string | null;
  roomId: string | null;
  requestedHostelId: string | null;
}

function toUser(user: BackendUser): User {
  return { ...user };
}

function toStudent(response: StudentResponse): Student {
  return {
    ...toUser(response),
    role: "STUDENT",
    membershipStatus: response.membershipStatus,
    ...(response.hostelId ? { hostelId: response.hostelId } : {}),
    ...(response.roomId ? { roomId: response.roomId } : {}),
    ...(response.requestedHostelId ? { requestedHostelId: response.requestedHostelId } : {}),
  };
}

const demoEmails: Record<UserRole, string> = {
  STUDENT: "student@example.com",
  LANDLORD: "landlord@example.com",
  CARETAKER: "caretaker@example.com",
  MARKET_AGENT: "agent@example.com",
  ADMIN: "admin@example.com",
};

export const authService = {
  async login({ email, password }: LoginInput): Promise<AuthSession> {
    const response = await http.post<LoginResponse>("/auth/login", { email, password });
    return { user: toUser(response.user), token: response.token };
  },

  async loginAsRole(role: UserRole): Promise<AuthSession> {
    return this.login({ email: demoEmails[role], password: "password" });
  },

  async validateHostelCode(code: string): Promise<boolean> {
    const response = await http.get<{ valid: boolean }>(
      `/auth/validate-hostel-code?code=${encodeURIComponent(code)}`,
    );
    return response.valid;
  },

  async registerStudent(input: RegisterStudentInput): Promise<AuthSession> {
    const response = await http.post<StudentResponse>("/auth/register/student", {
      ...input,
      hostelCode: input.hostelCode ?? "",
    });
    return { user: toStudent(response), token: "" };
  },

  async logout(): Promise<void> {
    return;
  },
};
