import { useCallback, useEffect, useState } from "react";
import { orderService } from "../services/orderService";
import type { Order, OrderStatus } from "../types/order";

export function useStudentOrders(studentId: string) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await orderService.listForStudent(studentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useAgentOrders(agentId: string) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await orderService.listForAgent(agentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const advance = useCallback(
    async (id: string, status: OrderStatus) => {
      await orderService.advanceStatus(id, status);
      await reload();
    },
    [reload],
  );

  return { data, loading, error, reload, advance };
}

export function useOrder(id: string, viewer: "student" | "agent" = "student") {
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await orderService.getById(id, viewer));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id, viewer]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
