import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { PriceDisplay } from "../common/PriceDisplay";
import { StatusBadge } from "../common/StatusBadge";
import styles from "./MpesaPaymentModal.module.css";

type Phase = "form" | "pushing" | "success";

interface MpesaPaymentModalProps {
  open: boolean;
  amount: number;
  phone?: string;
  onClose: () => void;
  onConfirm: (input: { phone: string; mpesaCode: string }) => Promise<void>;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

function generateMpesaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function MpesaPaymentModal({
  open,
  amount,
  phone = "",
  onClose,
  onConfirm,
}: MpesaPaymentModalProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [rawPhone, setRawPhone] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (open && phase === "form" && !rawPhone && phone) {
    setRawPhone(phone);
  }

  function validate(): string | null {
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.length !== 10) return "Enter a valid 10-digit phone number.";
    if (!/^(?:254|0)[7][0-9]{8}$|^254[7][0-9]{8}$/.test(digits)) {
      return "Enter a valid M-Pesa number (e.g. 0712 345 678).";
    }
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPhase("pushing");
    await new Promise((r) => setTimeout(r, 2200));
    setMpesaCode(generateMpesaCode());
    setPhase("success");
  }

  async function handleConfirm() {
    try {
      await onConfirm({ phone: rawPhone, mpesaCode });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setPhase("form");
    }
  }

  return (
    <Modal
      open={open}
      title="Pay with M-Pesa"
      onClose={phase === "pushing" ? () => {} : onClose}
      size="sm"
      footer={
        phase === "form" ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()}>Send STK Push</Button>
          </>
        ) : phase === "success" ? (
          <Button onClick={() => void handleConfirm()}>Confirm payment</Button>
        ) : undefined
      }
    >
      {phase === "form" && (
        <div className={styles.form}>
          <div className={styles.amountRow}>
            <span className={styles.amountLabel}>Amount</span>
            <PriceDisplay amount={amount} size="lg" />
          </div>
          <Input
            label="M-Pesa phone number"
            type="tel"
            placeholder="0712 345 678"
            value={rawPhone}
            onChange={(e) => setRawPhone(formatPhone(e.target.value))}
            error={error ?? undefined}
          />
          <p className={styles.hint}>
            An STK push will be sent to your phone to authorise the payment.
          </p>
        </div>
      )}
      {phase === "pushing" && (
        <div className={styles.state}>
          <div className={styles.spinner} aria-hidden />
          <h3 className={styles.stateTitle}>Sending STK push…</h3>
          <p className={styles.stateBody}>
            Check your phone {formatPhone(rawPhone)} for the M-Pesa prompt.
          </p>
        </div>
      )}
      {phase === "success" && (
        <div className={styles.state}>
          <div className={styles.successIcon} aria-hidden>✓</div>
          <h3 className={styles.stateTitle}>STK push accepted</h3>
          <p className={styles.stateBody}>
            Payment of <PriceDisplay amount={amount} size="sm" /> sent to{" "}
            {formatPhone(rawPhone)}.
          </p>
          <div className={styles.codeRow}>
            <span className={styles.codeLabel}>Transaction code</span>
            <span className={styles.codeValue}>{mpesaCode}</span>
          </div>
          <StatusBadge status="PAID" />
        </div>
      )}
    </Modal>
  );
}