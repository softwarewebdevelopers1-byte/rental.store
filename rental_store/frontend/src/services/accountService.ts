import { http } from "./apiClient";
import type { User } from "../types/user";

interface AccountUpdateResponse {
  id: string;
  name: string;
  email: string;
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
  async update(input: AccountUpdateInput): Promise<User> {
    const response = await http.patch<AccountUpdateResponse>("/account/me", input);
    return {
      ...response,
      avatarUrl: response.avatarUrl ?? undefined,
    };
  },
};
