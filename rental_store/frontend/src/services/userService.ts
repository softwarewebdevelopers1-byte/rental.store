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

const userCache = new Map<string, User>();

export const userService = {
  async getById(id: string): Promise<User | null> {
    const cached = userCache.get(id);
    if (cached) return cached;
    const user = toUser(await http.get<UserSummaryResponse>(`/admin/users/${id}`));
    userCache.set(id, user);
    return user;
  },

  async listByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
    const page = await http.get<Page<UserSummaryResponse>>(`/admin/users?${query}`);
    const users = page.content.map(toUser);
    users.forEach((user) => userCache.set(user.id, user));
    return users;
  },
};
