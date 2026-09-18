import { useAuth } from "../../hooks/useAuth";
import { useStudentPayments } from "../../hooks/usePayments";
import { PageHeader } from "../../components/layout/PageHeader";
import { PaymentCard } from "../../components/payments/PaymentCard";
import { PaymentTable } from "../../components/payments/PaymentTable";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { Button } from "../../components/common/Button";
import { useToast } from "../../hooks/useToast";
import { paymentService } from "../../services/paymentService";
import styles from "./StudentPaymentsPage.module.css";

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const { summary, loading, error, reload } = useStudentPayments(
    user?.id ?? "",
  );

  async function simulatePayment() {
    if (!user) return;
    const next = summary?.history.find((p) => p.status !== "PAID");
    if (!next) {
      show("No outstanding payment", "info");
      return;
    }
    await paymentService.createPayment({
      ...next,
      status: "PAID",
      method: "MPESA",
    });
    show("Payment recorded (mock).", "success");
    await reload();
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Payments"
        subtitle="Your rent, dues, and payment history."
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
              amount={summary.history.find((p) => p.status !== "PAID")?.amount}
              status={summary.status}
              dueDate={summary.nextDueDate}
            />
          </div>
          <div className={styles.actions}>
            <Button onClick={() => void simulatePayment()}>
              Pay next rent (mock)
            </Button>
          </div>
          <PaymentTable payments={summary.history} />
        </>
      ) : null}
    </div>
  );
}
