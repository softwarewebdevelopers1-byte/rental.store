import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { PriceDisplay } from "../common/PriceDisplay";
import { StatusBadge } from "../common/StatusBadge";
import { bookingService, type BookingResponse } from "../../services/bookingService";
import { paymentService } from "../../services/paymentService";
import { poll, type PollOptions } from "../../utils/polling";
import type { Room } from "../../types/room";
import styles from "./RequestRoomModal.module.css";

type Phase = "options" | "initiating" | "waiting" | "success" | "failure" | "timeout";

interface RequestRoomModalProps {
  open: boolean;
  room: Room | null;
  phone?: string;
  onClose: () => void;
  onChat: () => void;
  onSuccess: () => void;
  onUpdated?: () => void;
}

export function RequestRoomModal({
  open,
  room,
  phone,
  onClose,
  onChat,
  onSuccess,
  onUpdated,
}: RequestRoomModalProps) {
  const [phase, setPhase] = useState<Phase>("options");
  const [bookingId, setBookingId] = useState<string | null>(null);
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
    return () => {
      openRef.current = false;
      activePoll.current?.cancel();
    };
  }, [open, room?.id]);

  function close() {
    activePoll.current?.cancel();
    activePoll.current = null;
    onClose();
  }

  async function startPolling(id: string) {
    if (!openRef.current) return;
    const options: PollOptions = {
      intervalMs: 5000,
      maxAttempts: 12,
      shouldStop: (result) => {
        const booking = result as BookingResponse;
        return booking.paymentStatus === "PAID"
          || booking.paymentStatus === "FAILED"
          || booking.status === "CANCELLED";
      },
    };
    const controller = poll(() => bookingService.getById(id), options);
    activePoll.current = controller;
    try {
      const result = await controller.promise;
      if (!result) return;
      if (result.paymentStatus === "PAID") {
        setPhase("success");
        onSuccess();
      } else if (result.paymentStatus === "FAILED" || result.status === "CANCELLED") {
        setBookingId(null);
        setPhase("failure");
        setError("Your payment was not completed. The room is no longer held.");
        onUpdated?.();
      } else {
        setPhase("timeout");
      }
    } catch (pollError) {
      if (activePoll.current === controller) {
        setPhase("failure");
        setError(pollError instanceof Error ? pollError.message : "Unable to check payment status");
      }
    } finally {
      if (activePoll.current === controller) activePoll.current = null;
    }
  }

  async function payNow() {
    if (!room) return;
    if (!phone) {
      setError("Add an E.164 phone number to your profile before paying.");
      setPhase("failure");
      return;
    }

    setPhase("initiating");
    setError(null);
    try {
      let id = bookingId;
      if (!id) {
        const booking = await bookingService.create({
          roomId: room.id,
          moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          initiation: "PAY_NOW",
          message: "I'd like to request this room.",
        });
        id = booking.id;
        setBookingId(id);
      }
      const payment = await paymentService.payheroInitiate({ bookingRequestId: id, phone });
      if (!openRef.current) return;
      if (payment.status === "PAID") {
        setPhase("success");
        onSuccess();
        return;
      }
      if (payment.status === "FAILED") {
        setBookingId(null);
        setPhase("failure");
        setError(payment.message || "PayHero could not start your payment. The room is no longer held.");
        onUpdated?.();
        return;
      }
      setPhase("waiting");
      void startPolling(id);
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

  function retry() {
    setError(null);
    void payNow();
  }

  function refresh() {
    if (!bookingId) {
      setPhase("options");
      return;
    }
    setPhase("waiting");
    void startPolling(bookingId);
  }

  return (
    <Modal
      open={open}
      title="Request this room"
      onClose={close}
      size="sm"
      footer={
        phase === "options" ? (
          <>
            <Button variant="secondary" onClick={onChat}>Chat landlord</Button>
            <Button onClick={() => void payNow()}>Pay now</Button>
          </>
        ) : phase === "failure" ? (
          <>
            <Button variant="secondary" onClick={close}>Close</Button>
            <Button onClick={retry}>Try again</Button>
          </>
        ) : phase === "timeout" ? (
          <>
            <Button variant="secondary" onClick={close}>Close</Button>
            <Button onClick={refresh}>Refresh</Button>
          </>
        ) : phase === "success" ? (
          <Button onClick={close}>Done</Button>
        ) : undefined
      }
    >
      {room && (
        <div className={styles.content}>
          <div className={styles.summary}>
            <strong>Room {room.number}</strong>
            <PriceDisplay
              amount={room.price}
              suffix={`/${room.billingPeriod === "MONTHLY" ? "month" : "period"}`}
            />
          </div>

          {phase === "options" && (
            <>
              <p className={styles.prompt}>
                Pay now to send an M-Pesa STK prompt to the phone number saved on your profile.
              </p>
              {error && <p className={styles.body}>{error}</p>}
            </>
          )}

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
              <p className={styles.body}>Your booking request is awaiting landlord approval.</p>
              <StatusBadge status="PAID" />
            </div>
          )}

          {phase === "failure" && (
            <div className={styles.state}>
              <div className={styles.failureIcon} aria-hidden>!</div>
              <h3>Payment failed</h3>
              <p className={styles.body}>{error ?? "The payment was not completed."}</p>
            </div>
          )}

          {phase === "timeout" && (
            <div className={styles.state}>
              <h3>Payment not confirmed</h3>
              <p className={styles.body}>We have not received confirmation yet. You can refresh or check your dashboard.</p>
              <Link className={styles.link} to="/student/dashboard" onClick={close}>Open student dashboard</Link>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
