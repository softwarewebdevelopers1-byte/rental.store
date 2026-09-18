import {
  mockUsers,
  mockStudents,
  mockLandlords,
  mockCaretakers,
  mockAgents,
  mockAdmins,
} from "../data/users";
import { mockHostels } from "../data/hostels";
import { mockRooms } from "../data/rooms";
import { mockPayments } from "../data/payments";
import { mockOrders } from "../data/orders";
import { mockConflicts } from "../data/conflicts";
import { mockInvitations } from "../data/invitations";
import type {
  User,
  Student,
  Landlord,
  Caretaker,
  MarketAgent,
  Admin,
  UserRole,
} from "../types/user";
import type { Hostel } from "../types/hostel";
import type { Room } from "../types/room";
import type { Order } from "../types/order";
import type { Conflict } from "../types/conflict";
import type { Invitation, InvitationKind } from "../types/invitation";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export interface PlatformStats {
  totalStudents: number;
  totalLandlords: number;
  totalCaretakers: number;
  totalMarketAgents: number;
  totalHostels: number;
  totalRooms: number;
  vacantRooms: number;
  bookedRooms: number;
  pendingVerifications: number;
  pendingStudentRequests: number;
  marketplaceOrders: number;
  marketplaceConflicts: number;
}

export interface UserFilter {
  role?: UserRole;
  active?: boolean;
  q?: string;
}

export const adminService = {
  async stats(): Promise<PlatformStats> {
    const pendingVerifications = mockLandlords.filter(
      (l) => l.verificationStatus === "PENDING",
    ).length;
    const pendingStudentRequests = mockStudents.filter(
      (s) => s.membershipStatus === "PENDING" && s.requestedHostelId,
    ).length;

    return delay({
      totalStudents: mockStudents.length,
      totalLandlords: mockLandlords.length,
      totalCaretakers: mockCaretakers.length,
      totalMarketAgents: mockAgents.length,
      totalHostels: mockHostels.filter((h) => h.active).length,
      totalRooms: mockRooms.length,
      vacantRooms: mockRooms.filter((r) => r.status === "VACANT").length,
      bookedRooms: mockRooms.filter((r) => r.status === "BOOKED").length,
      pendingVerifications,
      pendingStudentRequests,
      marketplaceOrders: mockOrders.length,
      marketplaceConflicts: mockConflicts.filter(
        (c) => c.status !== "RESOLVED" && c.status !== "REJECTED",
      ).length,
    });
  },

  async listUsers(filter: UserFilter = {}): Promise<User[]> {
    let items = [...mockUsers];
    if (filter.role) items = items.filter((u) => u.role === filter.role);
    if (filter.active !== undefined)
      items = items.filter((u) => u.active === filter.active);
    if (filter.q) {
      const needle = filter.q.toLowerCase();
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(needle) ||
          u.email.toLowerCase().includes(needle),
      );
    }
    return delay(items);
  },

  async getUser(id: string): Promise<User | null> {
    return delay(mockUsers.find((u) => u.id === id) ?? null);
  },

  async setUserActive(id: string, active: boolean): Promise<User | null> {
    const u = mockUsers.find((x) => x.id === id);
    if (!u) return delay(null);
    u.active = active;
    return delay(u);
  },

  async listLandlords(): Promise<Landlord[]> {
    return delay([...mockLandlords]);
  },

  async listStudents(): Promise<Student[]> {
    return delay([...mockStudents]);
  },

  async listCaretakers(): Promise<Caretaker[]> {
    return delay([...mockCaretakers]);
  },

  async listAgents(): Promise<MarketAgent[]> {
    return delay([...mockAgents]);
  },

  async listHostels(): Promise<Hostel[]> {
    return delay([...mockHostels]);
  },

  async getHostel(id: string): Promise<Hostel | null> {
    return delay(mockHostels.find((h) => h.id === id) ?? null);
  },

  async getHostelRooms(id: string): Promise<Room[]> {
    return delay(mockRooms.filter((r) => r.hostelId === id));
  },

  async listVerificationRequests(): Promise<Landlord[]> {
    return delay(
      mockLandlords.filter((l) => l.verificationStatus === "PENDING"),
    );
  },

  async decideVerification(
    landlordId: string,
    decision: "APPROVED" | "REJECTED",
  ): Promise<Landlord | null> {
    const l = mockLandlords.find((x) => x.id === landlordId);
    if (!l) return delay(null);
    l.verificationStatus = decision;
    return delay(l);
  },

  async listInvitations(): Promise<Invitation[]> {
    return delay([...mockInvitations]);
  },

  async createInvitation(input: {
    kind: InvitationKind;
    email?: string;
    expiresAt: string;
  }): Promise<Invitation> {
    const prefix = input.kind === "LANDLORD" ? "LL" : "MA";
    const token = `${prefix}-${generateId("t").toUpperCase().slice(0, 8)}`;
    const invitation: Invitation = {
      id: generateId("inv"),
      kind: input.kind,
      email: input.email,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
      status: "ACTIVE",
    };
    mockInvitations.push(invitation);
    return delay(invitation);
  },

  async revokeInvitation(id: string): Promise<Invitation | null> {
    const inv = mockInvitations.find((i) => i.id === id);
    if (!inv) return delay(null);
    inv.status = "REVOKED";
    return delay(inv);
  },

  async listOrders(): Promise<Order[]> {
    return delay(
      [...mockOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async listConflicts(): Promise<Conflict[]> {
    return delay(
      [...mockConflicts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async getConflict(id: string): Promise<Conflict | null> {
    return delay(mockConflicts.find((c) => c.id === id) ?? null);
  },

  async resolveConflict(
    id: string,
    resolution: string,
  ): Promise<Conflict | null> {
    const c = mockConflicts.find((x) => x.id === id);
    if (!c) return delay(null);
    c.status = "RESOLVED";
    c.resolution = resolution;
    c.resolvedAt = new Date().toISOString();
    return delay(c);
  },

  // Referenced by payments page; kept here so adminService is self-contained.
  async listPayments() {
    return delay([...mockPayments]);
  },
};

// Also export the collection of admins for completeness.
export const adminUsers: Admin[] = mockAdmins;
