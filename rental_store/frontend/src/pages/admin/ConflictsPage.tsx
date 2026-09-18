import { Link } from "react-router-dom";
import { useAdminConflicts } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Button } from "../../components/common/Button";
import type { Conflict } from "../../types/conflict";

export default function ConflictsPage() {
  const { data, loading } = useAdminConflicts();

  const columns: Column<Conflict>[] = [
    {
      key: "id",
      label: "ID",
      render: (c) => (
        <code
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
        >
          #{c.id.slice(-6).toUpperCase()}
        </code>
      ),
    },
    {
      key: "order",
      label: "Order",
      render: (c) => `#${c.orderId.slice(-6).toUpperCase()}`,
    },
    { key: "issue", label: "Issue", render: (c) => c.issue.replace(/_/g, " ") },
    {
      key: "status",
      label: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "created",
      label: "Created",
      hideOnMobile: true,
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Conflicts"
        subtitle="Marketplace issues reported by students."
      />
      <DataTable<Conflict>
        rows={data}
        columns={columns}
        keyFor={(c) => c.id}
        loading={loading}
        actions={(c) => (
          <Link to={`/admin/conflicts/${c.id}`}>
            <Button size="sm" variant="secondary">
              Review
            </Button>
          </Link>
        )}
      />
    </div>
  );
}
