import { http } from "./apiClient";
import type { User } from "../types/user";

interface UserSummaryResponse {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  active: boolean;
  createdAt: string;
}

interface Page<T> {
  content: T[];
}

function toUser(raw: UserSummaryResponse): User {
  return { ...raw };
}

export const userService = {
  async getById(id: string): Promise<User | null> {
    return toUser(await http.get<UserSummaryResponse>(`/admin/users/${id}`));
  },

  async listByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
    const page = await http.get<Page<UserSummaryResponse>>(`/admin/users?${query}`);
    return page.content.map(toUser);
  },
};
