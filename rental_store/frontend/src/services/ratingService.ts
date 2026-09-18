import { mockRatings } from "../data/ratings";
import type { Rating } from "../types/rating";
import { delay } from "../utils/delay";
import { generateId } from "../utils/idGenerator";

export const ratingService = {
  async listForHostel(hostelId: string): Promise<Rating[]> {
    return delay(
      mockRatings
        .filter((r) => r.hostelId === hostelId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async submit(input: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
    const rating: Rating = {
      ...input,
      id: generateId("rt"),
      createdAt: new Date().toISOString(),
    };
    mockRatings.push(rating);
    return delay(rating);
  },

  async hasStudentRated(hostelId: string, studentId: string): Promise<boolean> {
    return delay(
      mockRatings.some(
        (r) => r.hostelId === hostelId && r.studentId === studentId,
      ),
    );
  },
};
