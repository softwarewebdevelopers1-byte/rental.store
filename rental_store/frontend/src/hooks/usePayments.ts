import { useCallback, useEffect, useState } from "react";
import { paymentService, type StudentPaymentSummary } from "../services/paymentService";
import type {
  LandlordPaymentSummaryResponse,
  Page,
  Payment,
  PaymentHistoryFilter,
  PaymentSummaryResponse,
} from "../types/payment";
import { useDebounce } from "./useDebounce";

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

export function useRecordedPayments(
  role: "LANDLORD" | "CARETAKER",
  initialFilter: PaymentHistoryFilter = {},
) {
  const [filter, setFilterState] = useState(initialFilter);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(20);
  const [data, setData] = useState<Page<PaymentSummaryResponse> | null>(null);
  const [summary, setSummary] = useState<LandlordPaymentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedStudentQuery = useDebounce(filter.studentQuery ?? "", 300);
  const nonSearchFilter = { ...filter, studentQuery: undefined };
  const nonSearchFilterKey = JSON.stringify(nonSearchFilter);

  const setFilter = useCallback((patch: Partial<PaymentHistoryFilter>) => {
    setFilterState((current) => ({ ...current, ...patch }));
    setPage(0);
  }, []);

  const setPageSize = useCallback((value: number) => {
    setPageSizeState(value);
    setPage(0);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const requestFilter = { ...nonSearchFilter, studentQuery: debouncedStudentQuery || undefined };
    try {
      const [pageData, summaryData] = await Promise.all([
        role === "LANDLORD"
          ? paymentService.searchLandlordPayments(requestFilter, { page, size: pageSize })
          : paymentService.searchCaretakerPayments(requestFilter, { page, size: pageSize }),
        role === "LANDLORD"
          ? paymentService.landlordSummary()
          : paymentService.caretakerSummary(),
      ]);
      setData(pageData);
      setSummary(summaryData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [debouncedStudentQuery, nonSearchFilterKey, page, pageSize, role]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    data,
    summary,
    loading,
    error,
    reload,
    setFilter,
    filter,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}
