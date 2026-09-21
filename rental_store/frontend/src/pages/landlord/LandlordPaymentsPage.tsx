import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { EmptyState } from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/Skeleton";
import { RecordPaymentModal } from "../../components/payments/RecordPaymentModal";
import { useRecordedPayments } from "../../hooks/usePayments";
import type { PaymentHistoryFilter } from "../../types/payment";

export default function LandlordPaymentsPage() {
  const [modal, setModal] = useState<"single" | "batch" | null>(null);
  const payments = useRecordedPayments("LANDLORD");
  const summary = payments.summary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <PageHeader title="Payments" subtitle="Rent paid, pending, and overdue across your hostels."
        actions={<div style={{ display: "flex", gap: 8 }}><Button onClick={() => setModal("single")}>Record payment</Button><Button variant="secondary" onClick={() => setModal("batch")}>Record batch</Button></div>} />
      {payments.loading && !summary ? <Skeleton height={160} radius="var(--radius-lg)" /> : (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
            <StatCard label="Collected this month" value={(summary?.totalCollectedThisMonth ?? 0).toLocaleString()} tone="success" />
            <StatCard label="Paid" value={summary?.totalPaidCount ?? 0} tone="success" />
            <StatCard label="Pending" value={summary?.totalPendingCount ?? 0} tone="warning" />
            <StatCard label="Overdue" value={summary?.totalOverdueCount ?? 0} tone="danger" />
          </section>
          <PaymentFilters filter={payments.filter} hostels={summary?.byHostel ?? []} setFilter={payments.setFilter} />
          {!payments.data?.content.length ? <EmptyState title="No payment records" description="Recorded payments will appear here." /> : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Date paid", "Student", "Hostel", "Room", "Amount", "Method", "Period", "Recorded by", "Status"].map((label) => <th key={label} style={{ textAlign: label === "Amount" ? "right" : "left", padding: 10 }}>{label}</th>)}</tr></thead>
                  <tbody>{payments.data.content.map((payment) => <tr key={payment.id}>
                    <td style={{ padding: 10 }}>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-"}</td>
                    <td style={{ padding: 10 }}>{payment.studentName ?? payment.studentId}</td>
                    <td style={{ padding: 10 }}>{payment.hostelName ?? payment.hostelId}</td>
                    <td style={{ padding: 10 }}>{payment.roomNumber ?? "-"}</td>
                    <td style={{ padding: 10, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{payment.amount.toLocaleString()}</td>
                    <td style={{ padding: 10 }}>{payment.method ?? "-"}</td>
                    <td style={{ padding: 10 }}>{payment.periodLabel ?? "-"}</td>
                    <td style={{ padding: 10 }}>{payment.recordedByName ?? "-"}</td>
                    <td style={{ padding: 10 }}>{payment.status}</td>
                  </tr>)}</tbody>
                </table>
              </div>
              <Pagination page={payments.page} totalPages={payments.data.totalPages} setPage={payments.setPage} pageSize={payments.pageSize} setPageSize={payments.setPageSize} />
            </>
          )}
        </>
      )}
      <RecordPaymentModal open={modal !== null} mode={modal ?? "single"} onClose={() => setModal(null)} onSuccess={payments.reload} />
    </div>
  );
}

function PaymentFilters({
  filter,
  hostels,
  setFilter,
}: {
  filter: PaymentHistoryFilter;
  hostels: Array<{ hostelId: string; hostelName: string }>;
  setFilter: (patch: Partial<PaymentHistoryFilter>) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, alignItems: "end" }}>
      <Input label="Student" value={filter.studentQuery ?? ""} onChange={(e) => setFilter({ studentQuery: e.target.value })} placeholder="Name or email" />
      <Select label="Hostel" value={filter.hostelId ?? ""} onChange={(e) => setFilter({ hostelId: e.target.value || undefined })}
        options={[{ value: "", label: "All hostels" }, ...hostels.map((h) => ({ value: h.hostelId, label: h.hostelName }))]} />
      <Select label="Status" value={filter.status ?? ""} onChange={(e) => setFilter({ status: (e.target.value || undefined) as PaymentHistoryFilter["status"] })}
        options={[{ value: "", label: "All statuses" }, { value: "PAID", label: "Paid" }, { value: "PENDING", label: "Pending" }, { value: "OVERDUE", label: "Overdue" }]} />
      <Select label="Method" value={filter.method ?? ""} onChange={(e) => setFilter({ method: (e.target.value || undefined) as PaymentHistoryFilter["method"] })}
        options={[{ value: "", label: "All methods" }, { value: "MPESA", label: "M-Pesa" }, { value: "CASH", label: "Cash" }, { value: "BANK", label: "Bank" }, { value: "CARD", label: "Card" }]} />
      <Input label="From" type="date" value={filter.fromDate ?? ""} onChange={(e) => setFilter({ fromDate: e.target.value || undefined })} />
      <Input label="To" type="date" value={filter.toDate ?? ""} onChange={(e) => setFilter({ toDate: e.target.value || undefined })} />
      <Input label="Period" value={filter.periodLabel ?? ""} onChange={(e) => setFilter({ periodLabel: e.target.value || undefined })} />
      <Button variant="secondary" onClick={() => setFilter({ studentQuery: undefined, hostelId: undefined, status: undefined, method: undefined, fromDate: undefined, toDate: undefined, periodLabel: undefined })}>Clear filters</Button>
    </div>
  );
}

function Pagination({ page, totalPages, setPage, pageSize, setPageSize }: { page: number; totalPages: number; setPage: (page: number) => void; pageSize: number; setPageSize: (size: number) => void }) {
  return <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
    <Select aria-label="Page size" value={String(pageSize)} onChange={(e) => setPageSize(Number(e.target.value))}
      options={[{ value: "10", label: "10" }, { value: "20", label: "20" }, { value: "50", label: "50" }]} />
    <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
    <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
    <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
  </div>;
}
