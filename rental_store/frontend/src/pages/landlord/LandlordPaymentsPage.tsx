import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { PaymentTable } from "../../components/payments/PaymentTable";
import { Skeleton } from "../../components/common/Skeleton";
import { mockHostels } from "../../data/hostels";
import { mockPayments } from "../../data/payments";
import type { Payment } from "../../types/payment";

export default function LandlordPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      const hostelIds = new Set(
        mockHostels.filter((h) => h.landlordId === user?.id).map((h) => h.id),
      );
      const filtered = mockPayments.filter((p) => hostelIds.has(p.hostelId));
      if (!cancelled) {
        setPayments(filtered);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const paid = payments.filter((p) => p.status === "PAID").length;
  const pending = payments.filter((p) => p.status === "PENDING").length;
  const overdue = payments.filter((p) => p.status === "OVERDUE").length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <PageHeader
        title="Payments"
        subtitle="Rent paid, pending, and overdue across your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            <StatCard label="Paid" value={paid} tone="success" />
            <StatCard label="Pending" value={pending} tone="warning" />
            <StatCard label="Overdue" value={overdue} tone="danger" />
          </section>
          <PaymentTable payments={payments} />
        </>
      )}
    </div>
  );
}
