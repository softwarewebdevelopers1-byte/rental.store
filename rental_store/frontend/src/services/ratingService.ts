import { ApiError, http } from "./apiClient";
import type { Rating } from "../types/rating";

interface RatingResponse {
  id: string;
  hostelId: string;
  studentId: string;
  studentName: string;
  stars: number;
  comment: string | null;
  createdAt: string;
}

function toRating(raw: RatingResponse): Rating {
  return {
    id: raw.id,
    hostelId: raw.hostelId,
    studentId: raw.studentId,
    studentName: raw.studentName,
    stars: raw.stars,
    comment: raw.comment ?? "",
    createdAt: raw.createdAt,
  };
}

export const ratingService = {
  async listForHostel(hostelId: string): Promise<Rating[]> {
    const ratings = await http.get<RatingResponse[]>(`/ratings/hostel/${hostelId}`);
    return ratings.map(toRating);
  },

  async submit(input: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
    const raw = await http.post<RatingResponse>(`/ratings/me/hostel/${input.hostelId}`, {
      stars: input.stars,
      comment: input.comment,
    });
    return toRating(raw);
  },

  async hasStudentRated(hostelId: string, studentId: string): Promise<boolean> {
    void studentId;
    try {
      await http.get<RatingResponse>(`/ratings/me/hostel/${hostelId}`);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return false;
      throw error;
    }
  },
};
