import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import type { Room } from "../../types/room";

interface RoomFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: Room | null;
  onCancel: () => void;
  onSubmit: (values: { number: string; price: number }) => void;
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

  useEffect(() => {
    if (open) {
      setNumber(initial?.number ?? "");
      setPrice(initial ? String(initial.price) : "");
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
              valid && onSubmit({ number: number.trim(), price: Number(price) })
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
          label="Price (KES per month)"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
}
