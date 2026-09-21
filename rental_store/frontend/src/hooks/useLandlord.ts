import { useCallback, useEffect, useState } from "react";
import {
  hostelService,
  type HostelSummary,
  type LandlordStats,
  type PendingStudentRequest,
} from "../services/hostelService";
import { roomService } from "../services/roomService";
import type { Room } from "../types/room";
import type { Student } from "../types/user";

export function useLandlordStats(landlordId: string) {
  const [stats, setStats] = useState<LandlordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!landlordId) return;
    setLoading(true);
    setError(null);
    try {
      setStats(await hostelService.statsForLandlord(landlordId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { stats, loading, error, reload };
}

export function useLandlordHostels(landlordId: string) {
  const [data, setData] = useState<HostelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!landlordId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await hostelService.listByLandlord(landlordId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load hostels");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useHostelRooms(hostelId: string) {
  const [data, setData] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!hostelId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await roomService.listForHostel(hostelId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, [hostelId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useLandlordTenants(landlordId: string, hostelId?: string) {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!landlordId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await hostelService.listTenants(landlordId, hostelId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, [landlordId, hostelId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function usePendingRequests(landlordId: string) {
  const [data, setData] = useState<PendingStudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!landlordId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await hostelService.listPendingRequests(landlordId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const accept = useCallback(
    async (studentId: string, roomId: string) => {
      await hostelService.acceptRequest(studentId, roomId);
      await reload();
    },
    [reload],
  );

  const reject = useCallback(
    async (studentId: string) => {
      await hostelService.rejectRequest(studentId);
      await reload();
    },
    [reload],
  );

  return { data, loading, error, reload, accept, reject };
}
