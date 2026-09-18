import { useCallback, useEffect, useState } from "react";
import { ratingService } from "../services/ratingService";
import type { Rating } from "../types/rating";

export function useHostelRatings(hostelId: string) {
  const [data, setData] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!hostelId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await ratingService.listForHostel(hostelId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ratings");
    } finally {
      setLoading(false);
    }
  }, [hostelId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
