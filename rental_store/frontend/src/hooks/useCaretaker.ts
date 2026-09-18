import { useCallback, useEffect, useState } from "react";
import {
  caretakerService,
  type CaretakerStats,
  type TenantWithRoom,
} from "../services/caretakerService";
import type { Hostel } from "../types/hostel";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
} from "../types/maintenance";

export function useCaretakerHostels(caretakerId: string) {
  const [data, setData] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!caretakerId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await caretakerService.listAssignedHostels(caretakerId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load hostels");
    } finally {
      setLoading(false);
    }
  }, [caretakerId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useCaretakerStats(caretakerId: string) {
  const [stats, setStats] = useState<CaretakerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!caretakerId) return;
    setLoading(true);
    setError(null);
    try {
      setStats(await caretakerService.stats(caretakerId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [caretakerId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { stats, loading, error, reload };
}

export function useCaretakerMaintenance(caretakerId: string) {
  const [data, setData] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!caretakerId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await caretakerService.listMaintenance(caretakerId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [caretakerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setStatus = useCallback(
    async (id: string, status: MaintenanceStatus) => {
      await caretakerService.updateMaintenanceStatus(id, status);
      await reload();
    },
    [reload],
  );

  return { data, loading, error, reload, setStatus };
}

export function useCaretakerTenants(caretakerId: string) {
  const [data, setData] = useState<TenantWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!caretakerId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await caretakerService.listTenants(caretakerId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, [caretakerId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
