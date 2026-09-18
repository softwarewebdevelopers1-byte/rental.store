import { useCallback, useEffect, useState } from "react";
import {
  hostelService,
  type HostelFilters,
  type HostelSummary,
} from "../services/hostelService";

export function useHostels(filters: HostelFilters = {}) {
  const [data, setData] = useState<HostelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await hostelService.list(filters));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load hostels");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
