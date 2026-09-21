import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import type { BillingPeriod, Room } from "../../types/room";

interface RoomFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Room | null;
  onCancel: () => void;
  onSubmit: (values: {
    number: string;
    price: number;
    billingPeriod: BillingPeriod;
  }) => void;
  submitting?: boolean;
}

export function RoomFormModal({
  open,
  mode,
  initial,
  onCancel,
  onSubmit,
  submitting,
}: RoomFormModalProps) {
  const [number, setNumber] = useState("");
  const [price, setPrice] = useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("MONTHLY");

  useEffect(() => {
    if (open) {
      setNumber(initial?.number ?? "");
      setPrice(initial ? String(initial.price) : "");
      setBillingPeriod(initial?.billingPeriod ?? "MONTHLY");
    }
  }, [open, initial]);

  const valid = number.trim().length > 0 && Number(price) > 0;

  return (
    <Modal
      open={open}
      title={
        mode === "create" ? "Add room" : `Edit room ${initial?.number ?? ""}`
      }
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              valid &&
              onSubmit({
                number: number.trim(),
                price: Number(price),
                billingPeriod,
              })
            }
            disabled={!valid}
            loading={submitting}
          >
            {mode === "create" ? "Add room" : "Save changes"}
          </Button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <Input
          label="Room number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="e.g. A01"
          required
        />
        <Input
          label="Price (KES)"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Select
          label="Billing period"
          value={billingPeriod}
          onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
          options={[
            { value: "MONTHLY", label: "Per month" },
            { value: "SEMESTER", label: "Per semester" },
            { value: "TRISEMESTER", label: "Per trisemester" },
          ]}
        />
      </div>
    </Modal>
  );
}
