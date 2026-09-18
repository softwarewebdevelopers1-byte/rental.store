import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useStudentPayments } from "../../hooks/usePayments";
import { PageHeader } from "../../components/layout/PageHeader";
import { PaymentCard } from "../../components/payments/PaymentCard";
import { PaymentTable } from "../../components/payments/PaymentTable";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { Button } from "../../components/common/Button";
import { MpesaPaymentModal } from "../../components/payments/MpesaPaymentModal";
import { useToast } from "../../hooks/useToast";
import { paymentService } from "../../services/paymentService";
import styles from "./StudentPaymentsPage.module.css";

interface MpesaInput {
  phone: string;
  mpesaCode: string;
}

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const { summary, loading, error, reload } = useStudentPayments(
    user?.id ?? "",
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const outstanding = summary?.history.find((p) => p.status !== "PAID") ?? null;

  async function handleMpesaConfirm({ phone, mpesaCode }: MpesaInput) {
    if (!outstanding || !user) return;
    setSubmitting(true);
    try {
      await paymentService.createPayment({
        ...outstanding,
        status: "PAID",
        method: "MPESA",
        mpesaPhone: phone,
        mpesaCode,
      });
      show(`M-Pesa payment confirmed — ${mpesaCode}`, "success");
      await reload();
      setModalOpen(false);
    } catch (e) {
      show(
        e instanceof Error ? e.message : "Payment failed",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Payments"
        subtitle="Pay your rent and dues via M-Pesa."
      />
      {loading ? (
        <div className={styles.skeletons}>
          <Skeleton height={90} radius="var(--radius-lg)" />
          <Skeleton height={90} radius="var(--radius-lg)" />
          <Skeleton height={200} radius="var(--radius-lg)" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : summary ? (
        <>
          <div className={styles.topGrid}>
            <PaymentCard label="Current rent" amount={summary.currentRent} />
            <PaymentCard
              label="Current payment"
              amount={outstanding?.amount}
              status={outstanding?.status ?? summary.status}
              dueDate={outstanding?.dueDate ?? summary.nextDueDate}
            />
          </div>
          <div className={styles.actions}>
            <Button
              onClick={() => setModalOpen(true)}
              disabled={!outstanding || submitting}
            >
              Pay via M-Pesa (mock)
            </Button>
          </div>
          <PaymentTable payments={summary.history} />
        </>
      ) : null}

      <MpesaPaymentModal
        open={modalOpen}
        amount={outstanding?.amount ?? 0}
        phone={user?.phone}
        onClose={() => {
          if (!submitting) setModalOpen(false);
        }}
        onConfirm={handleMpesaConfirm}
      />
    </div>
  );
}