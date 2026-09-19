import { http } from "./apiClient";
import type { Invitation, InvitationKind } from "../types/invitation";

interface InvitationResponse {
  id: string;
  token: string;
  kind: InvitationKind;
  email: string | null;
  status: Invitation["status"];
  createdAt: string;
  expiresAt: string;
}

interface RedeemInvitationInput {
  name: string;
  email?: string;
  password: string;
  businessName?: string;
}

function toInvitation(raw: InvitationResponse): Invitation {
  return {
    id: raw.id,
    kind: raw.kind,
    token: raw.token,
    ...(raw.email ? { email: raw.email } : {}),
    status: raw.status,
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt,
  };
}

export const invitationService = {
  async getByToken(token: string): Promise<Invitation> {
    const raw = await http.get<InvitationResponse>(
      `/invitations/token/${encodeURIComponent(token)}`,
    );
    return toInvitation(raw);
  },

  async redeem(token: string, input: RedeemInvitationInput): Promise<void> {
    await http.post<void>(
      `/invitations/token/${encodeURIComponent(token)}/redeem`,
      input,
    );
  },
};
