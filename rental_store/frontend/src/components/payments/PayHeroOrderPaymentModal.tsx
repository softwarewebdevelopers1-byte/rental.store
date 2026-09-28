import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { PriceDisplay } from "../common/PriceDisplay";
import { StatusBadge } from "../common/StatusBadge";
import { orderService } from "../../services/orderService";
import { poll, type PollOptions } from "../../utils/polling";
import type { Order } from "../../types/order";
import styles from "./PayHeroOrderPaymentModal.module.css";

type Phase = "initiating" | "waiting" | "success" | "failure" | "timeout";

interface PayHeroOrderPaymentModalProps {
  open: boolean;
  order: Order | null;
  phone?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayHeroOrderPaymentModal({
  open,
  order,
  phone,
  onClose,
  onSuccess,
}: PayHeroOrderPaymentModalProps) {
  const [phase, setPhase] = useState<Phase>("initiating");
  const [error, setError] = useState<string | null>(null);
  const activePoll = useRef<{ cancel: () => void } | null>(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
    if (!open) {
      activePoll.current?.cancel();
      activePoll.current = null;
      return;
    }
    if (!order) return;
    setPhase("initiating");
    setError(null);
    void initiate(order);
    return () => {
      openRef.current = false;
      activePoll.current?.cancel();
    };
  }, [open, order?.id]);

  function close() {
    activePoll.current?.cancel();
    activePoll.current = null;
    onClose();
  }

  async function startPolling(orderId: string) {
    if (!openRef.current) return;
    const options: PollOptions = {
      intervalMs: 3000,
      maxAttempts: 20,
      shouldStop: (result) => {
        const current = result as Order;
        return current.status === "PAID" || current.status === "CANCELLED";
      },
    };
    const controller = poll(() => orderService.getById(orderId), options);
    activePoll.current = controller;
    try {
      const result = await controller.promise;
      if (!result || !openRef.current) return;
      if (result.status === "PAID") {
        setPhase("success");
        onSuccess();
      } else if (result.status === "CANCELLED") {
        setPhase("failure");
        setError("Your payment was not completed. The order was cancelled.");
      } else {
        setPhase("timeout");
      }
    } catch (pollError) {
      if (activePoll.current === controller && openRef.current) {
        setPhase("failure");
        setError(
          pollError instanceof Error
            ? pollError.message
            : "Unable to check payment status",
        );
      }
    } finally {
      if (activePoll.current === controller) activePoll.current = null;
    }
  }

  async function initiate(currentOrder: Order) {
    if (!phone) {
      setPhase("failure");
      setError("Add an E.164 phone number to your profile before paying.");
      return;
    }
    try {
      const response = await orderService.payheroInitiate(currentOrder.id, { phone });
      if (!openRef.current) return;
      if (response.status === "PAID") {
        setPhase("success");
        onSuccess();
        return;
      }
      setPhase("waiting");
      void startPolling(currentOrder.id);
    } catch (initiationError) {
      if (!openRef.current) return;
      setPhase("failure");
      setError(
        initiationError instanceof Error
          ? initiationError.message
          : "Unable to start the payment.",
      );
    }
  }

  if (!order) return null;

  return (
    <Modal
      open={open}
      title="Pay for your order"
      onClose={close}
      size="sm"
      footer={
        phase === "failure" || phase === "timeout" ? (
          <>
            <Button variant="secondary" onClick={close}>Close</Button>
            <Link to={`/student/orders/${order.id}`} onClick={close}>
              <Button>View order</Button>
            </Link>
          </>
        ) : phase === "success" ? (
          <Button onClick={close}>Done</Button>
        ) : undefined
      }
    >
      <div className={styles.content}>
        <div className={styles.summary}>
          <strong>Marketplace order</strong>
          <PriceDisplay amount={order.total} />
        </div>

        {(phase === "initiating" || phase === "waiting") && (
          <div className={styles.state}>
            <div className={styles.spinner} aria-hidden />
            <h3>{phase === "initiating" ? "Starting payment…" : "Waiting for payment…"}</h3>
            <p className={styles.body}>
              Check {phone} for the M-Pesa prompt and enter your PIN.
            </p>
          </div>
        )}

        {phase === "success" && (
          <div className={styles.state}>
            <div className={styles.successIcon} aria-hidden>✓</div>
            <h3>Payment received</h3>
            <p className={styles.body}>Your order has been sent to the seller.</p>
            <StatusBadge status="PAID" />
          </div>
        )}

        {phase === "failure" && (
          <div className={styles.state}>
            <div className={styles.failureIcon} aria-hidden>!</div>
            <h3>Payment not completed</h3>
            <p className={styles.body}>{error}</p>
          </div>
        )}

        {phase === "timeout" && (
          <div className={styles.state}>
            <h3>Payment not confirmed</h3>
            <p className={styles.body}>
              No confirmation arrived within 60 seconds. Check your order history for the latest status.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
