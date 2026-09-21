import { useEffect, useMemo, useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { hostelService } from "../../services/hostelService";
import { caretakerService } from "../../services/caretakerService";
import { paymentService } from "../../services/paymentService";
import type { PaymentBatchRecordRequest, PaymentRecordRequest } from "../../types/payment";
import type { Student } from "../../types/user";

export interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "single" | "batch";
  presetStudentId?: string;
  presetHostelId?: string;
}

export function RecordPaymentModal({
  open,
  onClose,
  onSuccess,
  mode = "single",
  presetStudentId,
  presetHostelId,
}: RecordPaymentModalProps) {
  const { user } = useAuth();
  const { show } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Array<{ id: string; name: string }>>([]);
  const [studentId, setStudentId] = useState(presetStudentId ?? "");
  const [hostelId, setHostelId] = useState(presetHostelId ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [dueDate, setDueDate] = useState("");
  const [method, setMethod] = useState<PaymentRecordRequest["method"]>("MPESA");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStudentId(presetStudentId ?? "");
    setHostelId(presetHostelId ?? "");
    let cancelled = false;
    (async () => {
      try {
        if (user?.role === "LANDLORD") {
          const [listedHostels, listedStudents] = await Promise.all([
            hostelService.listByLandlord(user.id),
            hostelService.listTenants(user.id),
          ]);
          if (!cancelled) {
            setHostels(listedHostels.map((h) => ({ id: h.id, name: h.name })));
            setStudents(listedStudents);
          }
        } else if (user?.role === "CARETAKER") {
          const [listedHostels, listedStudents] = await Promise.all([
            caretakerService.listAssignedHostels(user.id),
            caretakerService.listTenants(user.id),
          ]);
          if (!cancelled) {
            setHostels(listedHostels.map((h) => ({ id: h.id, name: h.name })));
            setStudents(listedStudents.map((item) => item.student));
          }
        }
      } catch (error) {
        if (!cancelled) show(error instanceof Error ? error.message : "Failed to load students", "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, presetHostelId, presetStudentId, show, user]);

  const visibleStudents = useMemo(
    () => students.filter((student) => {
      const query = studentQuery.toLowerCase().trim();
      return !query || student.name.toLowerCase().includes(query) || student.email.toLowerCase().includes(query);
    }),
    [studentQuery, students],
  );

  const total = mode === "single"
    ? Number(amount) || 0
    : selected.reduce((sum, id) => sum + Number(overrides[id] || amount || 0), 0);

  function toggleStudent(id: string) {
    setSelected((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  async function submit() {
    if (!dueDate || (mode === "single" ? !studentId : selected.length === 0)) {
      show("Select at least one student and provide a due date.", "error");
      return;
    }
    if (total <= 0 || (mode === "batch" && selected.some((id) => Number(overrides[id] || amount) <= 0))) {
      show("All payment amounts must be greater than zero.", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "single") {
        const payload: PaymentRecordRequest = {
          studentId,
          amount: Number(amount),
          dueDate,
          method,
          reference: reference || undefined,
          notes: notes || undefined,
          periodLabel: periodLabel || undefined,
        };
        if (user?.role === "LANDLORD") await paymentService.recordLandlordPayment(payload);
        else await paymentService.recordCaretakerPayment(payload);
      } else {
        const payload: PaymentBatchRecordRequest = {
          payments: selected.map((id) => ({
            studentId: id,
            amount: Number(overrides[id] || amount),
            dueDate,
            method,
            reference: reference || undefined,
          })),
          periodLabel: periodLabel || undefined,
        };
        await paymentService.recordBatch(payload);
      }
      show("Payment recorded.", "success");
      onClose();
      onSuccess();
    } catch (error) {
      show(error instanceof Error ? error.message : "Failed to record payment", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "batch" ? "Record batch payment" : "Record payment"} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => void submit()} loading={submitting}>Record payment</Button></>}>
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {mode === "single" ? (
          <>
            <Input label="Search students" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Name or email" />
            <Select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}
              options={[{ value: "", label: "Select student" }, ...visibleStudents.map((s) => ({ value: s.id, label: `${s.name} · ${s.email}` }))]} />
          </>
        ) : (
          <>
            <Select label="Hostel" value={hostelId} onChange={(e) => setHostelId(e.target.value)}
              options={[{ value: "", label: "All assigned hostels" }, ...hostels.map((h) => ({ value: h.id, label: h.name }))]} />
            <Input label="Search students" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Name or email" />
            <div style={{ maxHeight: 220, overflow: "auto", display: "grid", gap: 8 }}>
              {visibleStudents.filter((s) => !hostelId || s.hostelId === hostelId).map((student) => (
                <label key={student.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={selected.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                  <span>{student.name} · {student.email}</span>
                  <input aria-label={`Amount for ${student.name}`} type="number" min="1" value={overrides[student.id] ?? ""}
                    onChange={(e) => setOverrides((current) => ({ ...current, [student.id]: e.target.value }))} style={{ marginLeft: "auto", width: 100 }} />
                </label>
              ))}
            </div>
          </>
        )}
        {mode === "single" && <Input label="Amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />}
        {mode === "batch" && <Input label="Default amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />}
        <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Select label="Method" value={method ?? ""} onChange={(e) => setMethod(e.target.value as PaymentRecordRequest["method"])}
          options={[{ value: "MPESA", label: "M-Pesa" }, { value: "CASH", label: "Cash" }, { value: "BANK", label: "Bank" }, { value: "CARD", label: "Card" }]} />
        <Input label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
        {mode === "single" && <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />}
        <Input label="Period label" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} placeholder="October 2025" />
        <strong>Total: {total.toLocaleString()}</strong>
      </div>
    </Modal>
  );
}
