import { useCallback, useEffect, useState } from "react";
import {
  adminService,
  type PlatformStats,
  type UserFilter,
} from "../services/adminService";
import type {
  Caretaker,
  Landlord,
  MarketAgent,
  Student,
  User,
} from "../types/user";
import type { Hostel } from "../types/hostel";
import type { Room } from "../types/room";
import type { Order } from "../types/order";
import type { Conflict } from "../types/conflict";
import type { Invitation, InvitationKind } from "../types/invitation";

export function usePlatformStats() {
  const [data, setData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.stats());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useUsers(filter: UserFilter = {}) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listUsers(filter));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useLandlords() {
  const [data, setData] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listLandlords());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useStudents() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listStudents());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useCaretakers() {
  const [data, setData] = useState<Caretaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listCaretakers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useAgents() {
  const [data, setData] = useState<MarketAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listAgents());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useAdminHostels() {
  const [data, setData] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listHostels());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useAdminHostel(id: string) {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [h, r] = await Promise.all([
        adminService.getHostel(id),
        adminService.getHostelRooms(id),
      ]);
      setHostel(h);
      setRooms(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load hostel");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { hostel, rooms, loading, error, reload };
}

export function useVerifications() {
  const [data, setData] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listVerificationRequests());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);

  const decide = useCallback(
    async (id: string, decision: "APPROVED" | "REJECTED") => {
      await adminService.decideVerification(id, decision);
      await reload();
    },
    [reload],
  );

  return { data, loading, error, reload, decide };
}

export function useInvitations() {
  const [data, setData] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listInvitations());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (input: {
      kind: InvitationKind;
      email?: string;
      expiresAt: string;
    }) => {
      const inv = await adminService.createInvitation(input);
      await reload();
      return inv;
    },
    [reload],
  );

  const revoke = useCallback(
    async (id: string) => {
      await adminService.revokeInvitation(id);
      await reload();
    },
    [reload],
  );

  return { data, loading, error, reload, create, revoke };
}

export function useAdminOrders() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useAdminConflicts() {
  const [data, setData] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.listConflicts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useAdminConflict(id: string) {
  const [data, setData] = useState<Conflict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await adminService.getConflict(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const resolve = useCallback(
    async (resolution: string) => {
      await adminService.resolveConflict(id, resolution);
      await reload();
    },
    [id, reload],
  );

  return { data, loading, error, reload, resolve };
}
