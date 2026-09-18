import { useCallback, useEffect, useState } from "react";
import { maintenanceService } from "../services/maintenanceService";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
} from "../types/maintenance";

export function useStudentMaintenance(studentId: string) {
  const [data, setData] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await maintenanceService.listForStudent(studentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load maintenance");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (
      input: Omit<
        MaintenanceRequest,
        "id" | "createdAt" | "updatedAt" | "status"
      >,
    ) => {
      await maintenanceService.create(input);
      await reload();
    },
    [reload],
  );

  const setStatus = useCallback(
    async (id: string, status: MaintenanceStatus) => {
      await maintenanceService.updateStatus(id, status);
      await reload();
    },
    [reload],
  );

  return { data, loading, error, reload, create, setStatus };
}
