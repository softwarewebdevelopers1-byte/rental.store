import { http } from "./apiClient";
import type { User } from "../types/user";

interface AccountUpdateResponse {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  active: boolean;
  createdAt: string;
}

export interface AccountUpdateInput {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const accountService = {
  async update(input: AccountUpdateInput): Promise<User> {
    return http.patch<AccountUpdateResponse>("/account/me", input);
  },
};
