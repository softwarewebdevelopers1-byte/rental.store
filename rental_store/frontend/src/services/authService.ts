import { mockUsers } from "../data/users";
import type { AuthSession, User, UserRole } from "../types/user";
import { delay } from "../utils/delay";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  hostelCode: string;
}

// Demo password for all mock users.
const DEMO_PASSWORD = "password";

export const authService = {
  async login({ email, password }: LoginInput): Promise<AuthSession> {
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user || password !== DEMO_PASSWORD) {
      throw new Error("Invalid credentials");
    }
    return delay({
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    });
  },

  async loginAsRole(role: UserRole): Promise<AuthSession> {
    const user = mockUsers.find((u) => u.role === role);
    if (!user) throw new Error(`No demo user for role ${role}`);
    return delay({ user, token: `mock-token-${user.id}` });
  },

  async validateHostelCode(code: string): Promise<boolean> {
    const { hostelService } = await import("./hostelService");
    const hostel = await hostelService.findByCode(code);
    return hostel !== null;
  },

  async registerStudent(input: RegisterStudentInput): Promise<AuthSession> {
    const { hostelService } = await import("./hostelService");
    const hostel = await hostelService.findByCode(input.hostelCode);
    if (!hostel) throw new Error("Invalid hostel code");

    const user: User = {
      id: `u-stu-${Date.now()}`,
      name: input.name,
      email: input.email,
      role: "STUDENT",
      active: true,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(user);
    return delay({ user, token: `mock-token-${user.id}` });
  },

  async logout(): Promise<void> {
    await delay(undefined, 100);
  },
};
