export type InvitationStatus = "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
export type InvitationKind = "LANDLORD" | "MARKET_AGENT";

export interface Invitation {
  id: string;
  kind: InvitationKind;
  token: string;
  email?: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
}
