import { http } from "./apiClient";
import type { User } from "../types/user";

interface AccountUpdateResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: User["role"];
  active: boolean;
  createdAt: string;
}

export interface AccountUpdateInput {
  email?: string;
  phone?: string;
  avatarUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const accountService = {
  async getCurrent(): Promise<User> {
    const response = await http.get<AccountUpdateResponse>("/account/me");
    return {
      ...response,
      phone: response.phone ?? undefined,
      avatarUrl: response.avatarUrl ?? undefined,
    };
  },

  async update(input: AccountUpdateInput): Promise<User> {
    const response = await http.patch<AccountUpdateResponse>("/account/me", input);
    return {
      ...response,
      phone: response.phone ?? undefined,
      avatarUrl: response.avatarUrl ?? undefined,
    };
  },
};
