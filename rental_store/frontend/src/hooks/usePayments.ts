import { useCallback, useEffect, useState } from "react";
import {
  paymentService,
  type StudentPaymentSummary,
} from "../services/paymentService";
import type { Payment } from "../types/payment";

export function useStudentPayments(studentId: string) {
  const [summary, setSummary] = useState<StudentPaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      setSummary(await paymentService.summaryForStudent(studentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const pay = useCallback(
    async (payment: Payment) => {
      await paymentService.createPayment({ ...payment, status: "PAID" });
      await reload();
    },
    [reload],
  );

  return { summary, loading, error, reload, pay };
}
