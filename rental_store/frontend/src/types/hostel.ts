export interface Hostel {
  id: string;
  landlordId: string;
  landlordPhone?: string;
  name: string;
  code: string;
  location: string;
  description?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  active: boolean;
  createdAt: string;
}
