import { http } from "./apiClient";
import type {
  Admin,
  Caretaker,
  Landlord,
  MarketAgent,
  Student,
  User,
  UserRole,
} from "../types/user";
import type { Hostel } from "../types/hostel";
import type { Room } from "../types/room";
import type { BillingPeriod } from "../types/room";
import type { Order, OrderStatus } from "../types/order";
import type { Conflict } from "../types/conflict";
import type { Invitation, InvitationKind } from "../types/invitation";

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

interface Page<T> {
  content: T[];
}

interface UserSummaryResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

interface StudentSummaryResponse extends UserSummaryResponse {
  membershipStatus: Student["membershipStatus"];
  hostelId: string | null;
  roomId: string | null;
  requestedHostelId: string | null;
}

interface LandlordSummaryResponse extends UserSummaryResponse {
  verificationStatus: Landlord["verificationStatus"];
}

interface LandlordResponse extends LandlordSummaryResponse {
  hostels: Array<{ id?: string }> | null;
}

interface CaretakerSummaryResponse extends UserSummaryResponse {
  assignedHostelIds: string[];
}

interface AgentSummaryResponse extends UserSummaryResponse {}

interface HostelSummaryResponse {
  id: string;
  name: string;
  code: string;
  location: string;
  mainImage: string | null;
  rating: number;
  reviewCount: number;
  vacantRooms: number;
  totalRooms: number;
  landlordVerified: boolean;
  landlordId: string;
  landlordName: string;
  active: boolean;
  createdAt: string;
}

interface HostelResponse extends HostelSummaryResponse {
  description: string | null;
  images: string[];
  active: boolean;
}

interface RoomResponse {
  id: string;
  hostelId: string;
  number: string;
  price: number;
  billingPeriod: BillingPeriod;
  status: Room["status"];
  tenantId: string | null;
  tenantName: string | null;
}

interface OrderSummaryResponse {
  id: string;
  status: OrderStatus;
  total: number;
  studentId: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
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

interface InvitationSummaryResponse {
  id: string;
  token: string;
  kind: InvitationKind;
  email: string | null;
  status: Invitation["status"];
  createdAt: string;
  expiresAt: string;
}

interface InvitationResponse extends InvitationSummaryResponse {}

function toUser(raw: UserSummaryResponse): User {
  return { ...raw };
}

function toStudent(raw: StudentSummaryResponse): Student {
  return {
    ...toUser(raw),
    role: "STUDENT",
    membershipStatus: raw.membershipStatus,
    ...(raw.hostelId ? { hostelId: raw.hostelId } : {}),
    ...(raw.roomId ? { roomId: raw.roomId } : {}),
    ...(raw.requestedHostelId ? { requestedHostelId: raw.requestedHostelId } : {}),
  };
}

function toLandlord(raw: LandlordSummaryResponse | LandlordResponse): Landlord {
  return {
    ...toUser(raw),
    role: "LANDLORD",
    verificationStatus: raw.verificationStatus,
    hostelIds: "hostels" in raw && raw.hostels
      ? raw.hostels.flatMap((hostel) => (hostel.id ? [hostel.id] : []))
      : [],
  };
}

function toCaretaker(raw: CaretakerSummaryResponse): Caretaker {
  return { ...toUser(raw), role: "CARETAKER", assignedHostelIds: raw.assignedHostelIds };
}

function toAgent(raw: AgentSummaryResponse): MarketAgent {
  return { ...toUser(raw), role: "MARKET_AGENT" };
}

function toHostel(raw: HostelSummaryResponse | HostelResponse): Hostel {
  return {
    id: raw.id,
    landlordId: raw.landlordId,
    name: raw.name,
    code: raw.code,
    location: raw.location,
    ...("description" in raw && raw.description ? { description: raw.description } : {}),
    images: "images" in raw ? raw.images : raw.mainImage ? [raw.mainImage] : [],
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    active: "active" in raw ? raw.active : true,
    createdAt: raw.createdAt,
  };
}

function toRoom(raw: RoomResponse): Room {
  return {
    ...raw,
    tenantId: raw.tenantId ?? undefined,
    tenantName: raw.tenantName ?? undefined,
  };
}

function toOrder(raw: OrderSummaryResponse): Order {
  return {
    id: raw.id,
    studentId: raw.studentId,
    agentId: raw.agentId,
    items: [],
    total: raw.total,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    timeline: [],
  };
}

function toConflict(raw: ConflictSummaryResponse | ConflictResponse): Conflict {
  return {
    id: raw.id,
    orderId: raw.orderId,
    studentId: raw.studentId,
    agentId: raw.agentId,
    issue: raw.issue,
    description: "description" in raw ? raw.description : "",
    status: raw.status,
    ...("resolution" in raw && raw.resolution ? { resolution: raw.resolution } : {}),
    createdAt: raw.createdAt,
    ...(raw.resolvedAt ? { resolvedAt: raw.resolvedAt } : {}),
  };
}

function toInvitation(raw: InvitationSummaryResponse | InvitationResponse): Invitation {
  return {
    id: raw.id,
    kind: raw.kind,
    token: raw.token,
    ...(raw.email ? { email: raw.email } : {}),
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt,
    status: raw.status,
  };
}

function pageQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const adminService = {
  async stats(): Promise<PlatformStats> {
    return http.get<PlatformStats>("/admin/stats");
  },

  async listUsers(filter: UserFilter = {}): Promise<User[]> {
    const page = await http.get<Page<UserSummaryResponse>>(
      `/admin/users${pageQuery({ q: filter.q, role: filter.role })}`,
    );
    return page.content
      .map(toUser)
      .filter((user) => filter.active === undefined || user.active === filter.active);
  },

  async getUser(id: string): Promise<User | null> {
    return toUser(await http.get<UserSummaryResponse>(`/admin/users/${id}`));
  },

  async setUserActive(id: string, active: boolean): Promise<User | null> {
    await http.patch<void>(`/admin/users/${id}/active?active=${active}`);
    return this.getUser(id);
  },

  async updateUser(
    id: string,
    input: { name?: string; email?: string; active?: boolean },
  ): Promise<User> {
    return toUser(await http.patch<UserSummaryResponse>(`/admin/users/${id}`, input));
  },

  async deleteUser(id: string): Promise<void> {
    await http.delete<void>(`/admin/users/${id}`);
  },

  async listLandlords(): Promise<Landlord[]> {
    const page = await http.get<Page<LandlordSummaryResponse>>("/landlords");
    return page.content.map(toLandlord);
  },

  async listStudents(): Promise<Student[]> {
    const page = await http.get<Page<StudentSummaryResponse>>("/students");
    return page.content.map(toStudent);
  },

  async listCaretakers(): Promise<Caretaker[]> {
    const page = await http.get<Page<CaretakerSummaryResponse>>("/caretakers");
    return page.content.map(toCaretaker);
  },

  async listAgents(): Promise<MarketAgent[]> {
    const page = await http.get<Page<AgentSummaryResponse>>("/agents");
    return page.content.map(toAgent);
  },

  async listHostels(): Promise<Hostel[]> {
    const page = await http.get<Page<HostelSummaryResponse>>("/admin/hostels");
    return page.content.map(toHostel);
  },

  async getHostel(id: string): Promise<Hostel | null> {
    return toHostel(await http.get<HostelResponse>(`/hostels/${id}`));
  },

  async getHostelRooms(id: string): Promise<Room[]> {
    const rooms = await http.get<RoomResponse[]>(`/hostels/${id}/rooms`);
    return rooms.map(toRoom);
  },

  async updateHostel(
    id: string,
    input: {
      name?: string;
      code?: string;
      location?: string;
      description?: string;
      active?: boolean;
    },
  ): Promise<Hostel> {
    return toHostel(await http.patch<HostelResponse>(`/hostels/${id}`, input));
  },

  async deleteHostel(id: string): Promise<void> {
    await http.delete<void>(`/hostels/${id}`);
  },

  async listVerificationRequests(): Promise<Landlord[]> {
    const page = await http.get<Page<LandlordSummaryResponse>>(
      "/admin/landlords/verifications",
    );
    return page.content.map(toLandlord);
  },

  async decideVerification(
    landlordId: string,
    decision: "APPROVED" | "REJECTED",
  ): Promise<Landlord | null> {
    const raw = await http.post<LandlordResponse>(
      `/admin/landlords/${landlordId}/verification`,
      { decision },
    );
    return toLandlord(raw);
  },

  async listInvitations(): Promise<Invitation[]> {
    const page = await http.get<Page<InvitationSummaryResponse>>("/invitations");
    return page.content.map(toInvitation);
  },

  async createInvitation(input: {
    kind: InvitationKind;
    email?: string;
    expiresInDays?: number;
    expiresInHours?: number;
  }): Promise<Invitation> {
    const raw = await http.post<InvitationResponse>("/invitations", {
      kind: input.kind,
      email: input.email,
      ...(input.expiresInDays !== undefined
        ? { expiresInDays: input.expiresInDays }
        : {}),
      ...(input.expiresInHours !== undefined
        ? { expiresInHours: input.expiresInHours }
        : {}),
    });
    return toInvitation(raw);
  },

  async revokeInvitation(id: string): Promise<Invitation | null> {
    return toInvitation(await http.post<InvitationResponse>(`/invitations/${id}/revoke`));
  },

  async listOrders(): Promise<Order[]> {
    const page = await http.get<Page<OrderSummaryResponse>>("/orders/admin");
    return page.content.map(toOrder);
  },

  async listConflicts(): Promise<Conflict[]> {
    const page = await http.get<Page<ConflictSummaryResponse>>("/conflicts/admin");
    return page.content.map(toConflict);
  },

  async getConflict(id: string): Promise<Conflict | null> {
    return toConflict(await http.get<ConflictResponse>(`/conflicts/${id}`));
  },

  async resolveConflict(id: string, resolution: string): Promise<Conflict | null> {
    const raw = await http.post<ConflictResponse>(`/conflicts/${id}/resolve`, {
      decision: "RESOLVED",
      resolution,
    });
    return toConflict(raw);
  },

  async listPayments() {
    throw new Error("Admin payment listing is not exposed by the frontend endpoint map");
  },
};

export const adminUsers: Admin[] = [];
