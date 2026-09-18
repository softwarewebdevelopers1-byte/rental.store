import { useCallback, useEffect, useState } from "react";
import { conflictService } from "../services/conflictService";
import type { Conflict } from "../types/conflict";

export function useAgentConflicts(agentId: string) {
  const [data, setData] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await conflictService.listForAgent(agentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conflicts");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

export function useStudentConflicts(studentId: string) {
  const [data, setData] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await conflictService.listForStudent(studentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conflicts");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
