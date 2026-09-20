import { useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useOrder } from "../../hooks/useOrders";
import { useToast } from "../../hooks/useToast";
import { orderService } from "../../services/orderService";
import { conflictService } from "../../services/conflictService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { OrderTimeline } from "../../components/marketplace/OrderTimeline";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { MpesaPaymentModal } from "../../components/payments/MpesaPaymentModal";
import { FileUpload } from "../../components/common/FileUpload";
import type { ConflictIssue } from "../../types/conflict";
import styles from "./StudentOrderDetailsPage.module.css";

const ISSUES: { value: ConflictIssue; label: string }[] = [
  { value: "WRONG_ITEM", label: "Wrong item" },
  { value: "DAMAGED_ITEM", label: "Damaged item" },
  { value: "MISSING_ITEM", label: "Missing item" },
  { value: "POOR_CONDITION", label: "Poor condition" },
  { value: "OTHER", label: "Other" },
];

export default function StudentOrderDetailsPage() {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { show } = useToast();
  const { data: order, loading, reload } = useOrder(orderId);

  const [reportOpen, setReportOpen] = useState(false);
  const [issue, setIssue] = useState<ConflictIssue>("DAMAGED_ITEM");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!order) return <EmptyState title="Order not found" />;

  async function confirmReceived() {
    await orderService.confirmReceived(order!.id);
    show("Order confirmed as received.", "success");
    await reload();
  }

  async function reportConflict(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await conflictService.create({
        orderId: order!.id,
        studentId: user.id,
        agentId: order!.agentId,
        issue,
        description,
        attachments,
      });
      await orderService.markConflict(order!.id);
      setReportOpen(false);
      setDescription("");
      setAttachments([]);
      show("Conflict reported. An admin will review it.", "success");
      await reload();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMpesaConfirm({ phone, mpesaCode }: { phone: string; mpesaCode: string }) {
    setPaying(true);
    try {
      await orderService.payOrder(order!.id, { phone, mpesaCode });
      show(`M-Pesa payment confirmed — ${mpesaCode}`, "success");
      setPayOpen(false);
      await reload();
    } catch (e) {
      show(
        e instanceof Error ? e.message : "Payment failed",
        "error",
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Order #${order.id.slice(-6).toUpperCase()}`}
        subtitle={new Date(order.createdAt).toLocaleString()}
        actions={
          <Link to="/student/orders">
            <Button variant="secondary">Back to orders</Button>
          </Link>
        }
      />

      <div className={styles.grid}>
        <Card title="Status">
          <StatusBadge status={order.status} />
          {order.mpesaCode && (
            <div className={styles.mpesaRow}>
              <span className={styles.mpesaLabel}>M-Pesa code</span>
              <span className={styles.mpesaCode}>{order.mpesaCode}</span>
            </div>
          )}
          <div style={{ marginTop: "var(--space-4)" }}>
            <OrderTimeline order={order} />
          </div>
        </Card>

        <Card title="Items">
          <ul className={styles.items}>
            {order.items.map((it, idx) => (
              <li key={`${it.refId}-${idx}`} className={styles.item}>
                <span>
                  {it.name} ×{it.quantity}
                </span>
                <PriceDisplay amount={it.unitPrice * it.quantity} size="sm" />
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>Total</span>
            <PriceDisplay amount={order.total} size="lg" />
          </div>
        </Card>
      </div>

      <div className={styles.actions}>
        {order.status === "PENDING_PAYMENT" && (
          <Button onClick={() => setPayOpen(true)} loading={paying}>
            Pay with M-Pesa
          </Button>
        )}
        {order.status === "DELIVERED" && (
          <Button variant="success" onClick={confirmReceived}>
            Confirm received
          </Button>
        )}
        {(order.status === "DELIVERED" || order.status === "RECEIVED") && (
          <Button variant="danger" onClick={() => setReportOpen(true)}>
            Report an issue
          </Button>
        )}
      </div>

      <MpesaPaymentModal
        open={payOpen}
        amount={order.total}
        phone={user?.phone}
        onClose={() => {
          if (!paying) setPayOpen(false);
        }}
        onConfirm={handleMpesaConfirm}
      />

      <Modal
        open={reportOpen}
        title="Report an issue"
        onClose={() => setReportOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setReportOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={reportConflict as unknown as () => void}
              loading={submitting}
              disabled={!description}
            >
              Submit report
            </Button>
          </>
        }
      >
        <form onSubmit={reportConflict} className={styles.form}>
          <Select
            label="Issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value as ConflictIssue)}
            options={ISSUES}
          />
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <FileUpload
            folder="conflicts"
            label="Attachments (optional)"
            accept="image/*,application/pdf"
            multiple
            value={attachments}
            onChange={setAttachments}
          />
        </form>
      </Modal>
    </div>
  );
}