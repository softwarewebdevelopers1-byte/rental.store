import { http } from "./apiClient";

interface LandlordResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export const landlordService = {
  async getById(id: string): Promise<LandlordResponse> {
    return await http.get<LandlordResponse>(`/landlords/${id}`);
  },
};
