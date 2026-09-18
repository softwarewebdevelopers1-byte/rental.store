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

export default function InvitationsPage() {
  const { show } = useToast();
  const { data, loading, create, revoke } = useInvitations();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<InvitationKind>("LANDLORD");
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("30");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const expiresAt = new Date(
        Date.now() + Number(days) * 86400_000,
      ).toISOString();
      const inv = await create({ kind, email: email || undefined, expiresAt });
      show(`Invitation created: ${inv.token}`, "success");
      setOpen(false);
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<Invitation>[] = [
    { key: "kind", label: "Type", render: (i) => i.kind.replace("_", " ") },
    {
      key: "token",
      label: "Token",
      render: (i) => <code className={styles.token}>{i.token}</code>,
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
        subtitle="Create invitation links for landlords and market agents."
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
            label="Expires in (days)"
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
