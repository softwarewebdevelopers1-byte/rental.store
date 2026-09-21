import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { EmptyState } from "../../components/common/EmptyState";
import { RecordPaymentModal } from "../../components/payments/RecordPaymentModal";
import { useRecordedPayments } from "../../hooks/usePayments";

export default function CaretakerPaymentsPage() {
  const [open, setOpen] = useState(false);
  const payments = useRecordedPayments("CARETAKER");
  const summary = payments.summary;
  const canRecord = (summary?.byHostel ?? []).length > 0;

  return <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
    <PageHeader title="Payments" subtitle="Payment history for your assigned hostels."
      actions={canRecord ? <Button onClick={() => setOpen(true)}>Record payment</Button> : undefined} />
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
      <StatCard label="Collected this month" value={(summary?.totalCollectedThisMonth ?? 0).toLocaleString()} tone="success" />
      <StatCard label="Paid" value={summary?.totalPaidCount ?? 0} tone="success" />
      <StatCard label="Pending" value={summary?.totalPendingCount ?? 0} tone="warning" />
      <StatCard label="Overdue" value={summary?.totalOverdueCount ?? 0} tone="danger" />
    </section>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, alignItems: "end" }}>
      <Input label="Student" value={payments.filter.studentQuery ?? ""} onChange={(e) => payments.setFilter({ studentQuery: e.target.value })} placeholder="Name or email" />
      <Select label="Status" value={payments.filter.status ?? ""} onChange={(e) => payments.setFilter({ status: (e.target.value || undefined) as "PAID" | "PENDING" | "OVERDUE" | undefined })}
        options={[{ value: "", label: "All statuses" }, { value: "PAID", label: "Paid" }, { value: "PENDING", label: "Pending" }, { value: "OVERDUE", label: "Overdue" }]} />
      <Input label="From" type="date" value={payments.filter.fromDate ?? ""} onChange={(e) => payments.setFilter({ fromDate: e.target.value || undefined })} />
      <Input label="To" type="date" value={payments.filter.toDate ?? ""} onChange={(e) => payments.setFilter({ toDate: e.target.value || undefined })} />
      <Button variant="secondary" onClick={() => payments.setFilter({ studentQuery: undefined, status: undefined, fromDate: undefined, toDate: undefined })}>Clear filters</Button>
    </div>
    {!canRecord && !payments.loading && <EmptyState title="You cannot record payments yet. Ask the landlord to grant you permission in the hostel settings." />}
    {!payments.data?.content.length ? <EmptyState title="No payment records" description="Payment history will appear here." /> : <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Date paid", "Student", "Hostel", "Room", "Amount", "Method", "Period", "Recorded by", "Status"].map((label) => <th key={label} style={{ textAlign: label === "Amount" ? "right" : "left", padding: 10 }}>{label}</th>)}</tr></thead>
        <tbody>{payments.data.content.map((payment) => <tr key={payment.id}>
          <td style={{ padding: 10 }}>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-"}</td><td style={{ padding: 10 }}>{payment.studentName ?? payment.studentId}</td><td style={{ padding: 10 }}>{payment.hostelName ?? payment.hostelId}</td><td style={{ padding: 10 }}>{payment.roomNumber ?? "-"}</td><td style={{ padding: 10, textAlign: "right" }}>{payment.amount.toLocaleString()}</td><td style={{ padding: 10 }}>{payment.method ?? "-"}</td><td style={{ padding: 10 }}>{payment.periodLabel ?? "-"}</td><td style={{ padding: 10 }}>{payment.recordedByName ?? "-"}</td><td style={{ padding: 10 }}>{payment.status}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    {payments.data && <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
      <Select aria-label="Page size" value={String(payments.pageSize)} onChange={(e) => payments.setPageSize(Number(e.target.value))} options={[{ value: "10", label: "10" }, { value: "20", label: "20" }, { value: "50", label: "50" }]} />
      <Button variant="secondary" disabled={payments.page === 0} onClick={() => payments.setPage(payments.page - 1)}>Previous</Button>
      <span>Page {payments.page + 1} of {Math.max(payments.data.totalPages, 1)}</span>
      <Button variant="secondary" disabled={payments.page + 1 >= payments.data.totalPages} onClick={() => payments.setPage(payments.page + 1)}>Next</Button>
    </div>}
    <RecordPaymentModal open={open} onClose={() => setOpen(false)} onSuccess={payments.reload} />
  </div>;
}
