import { useState, type FormEvent } from "react";
import { useInvitations } from "../../hooks/useAdmin";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/formatDate";
import type { Invitation, InvitationKind } from "../../types/invitation";
import styles from "./InvitationsPage.module.css";

type ExpirationUnit = "days" | "hours";

function invitationUrl(token: string): string {
  return new URL(
    `/register/invitation/${encodeURIComponent(token)}`,
    window.location.origin,
  ).toString();
}

export default function InvitationsPage() {
  const { show } = useToast();
  const { data, loading, create, revoke } = useInvitations();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<InvitationKind>("LANDLORD");
  const [email, setEmail] = useState("");
  const [expiration, setExpiration] = useState("30");
  const [expirationUnit, setExpirationUnit] = useState<ExpirationUnit>("days");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const duration = Number(expiration);
    if (!Number.isFinite(duration) || duration < 1) {
      show("Expiration must be at least 1.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await create({
        kind,
        email: email || undefined,
        ...(expirationUnit === "days"
          ? { expiresInDays: duration }
          : { expiresInHours: duration }),
      });
      show("Invitation created. Use the copy button to share the link.", "success");
      setOpen(false);
      setEmail("");
      setExpiration("30");
      setExpirationUnit("days");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyInvitationUrl(inv: Invitation) {
    try {
      await navigator.clipboard.writeText(invitationUrl(inv.token));
      show("Invitation link copied.", "success");
    } catch {
      show("Unable to copy the invitation link.", "error");
    }
  }

  const columns: Column<Invitation>[] = [
    { key: "kind", label: "Type", render: (i) => i.kind.replace("_", " ") },
    {
      key: "link",
      label: "Invitation link",
      render: (i) => (
        <div className={styles.linkCell}>
          <a
            className={styles.link}
            href={invitationUrl(i.token)}
            target="_blank"
            rel="noreferrer"
          >
            {invitationUrl(i.token)}
          </a>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void copyInvitationUrl(i)}
          >
            Copy
          </Button>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (i) => i.email ?? "—" },
    {
      key: "created",
      label: "Created",
      render: (i) => formatDate(i.createdAt),
    },
    {
      key: "expires",
      label: "Expires",
      render: (i) => formatDate(i.expiresAt),
    },
    {
      key: "status",
      label: "Status",
      render: (i) => <StatusBadge status={i.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invitations"
        subtitle="Create invitation links for landlords, caretakers, and market agents."
        actions={
          <Button onClick={() => setOpen(true)}>+ New invitation</Button>
        }
      />
      <DataTable<Invitation>
        rows={data}
        columns={columns}
        keyFor={(i) => i.id}
        loading={loading}
        actions={(i) =>
          i.status === "ACTIVE" ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => void revoke(i.id)}
            >
              Revoke
            </Button>
          ) : null
        }
      />

      <Modal
        open={open}
        title="Create invitation"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit as unknown as () => void}
              loading={submitting}
            >
              Create
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className={styles.form}>
          <Select
            label="Type"
            value={kind}
            onChange={(e) => setKind(e.target.value as InvitationKind)}
            options={[
              { value: "LANDLORD", label: "Landlord" },
              { value: "MARKET_AGENT", label: "Market Agent" },
              { value: "CARETAKER", label: "Caretaker" },
            ]}
          />
          <Input
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Only for record-keeping"
          />
          <Input
            label={`Expires in (${expirationUnit})`}
            type="number"
            min={1}
            max={expirationUnit === "days" ? 365 : 8760}
            step={1}
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
          />
          <Select
            label="Expiration unit"
            value={expirationUnit}
            onChange={(e) => setExpirationUnit(e.target.value as ExpirationUnit)}
            options={[
              { value: "days", label: "Days" },
              { value: "hours", label: "Hours" },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
