import { mockUsers } from "../data/users";
import type { User } from "../types/user";
import { delay } from "../utils/delay";

export const userService = {
  async getById(id: string): Promise<User | null> {
    return delay(mockUsers.find((u) => u.id === id) ?? null);
  },

  async listByIds(ids: string[]): Promise<User[]> {
    const set = new Set(ids);
    return delay(mockUsers.filter((u) => set.has(u.id)));
  },
};
