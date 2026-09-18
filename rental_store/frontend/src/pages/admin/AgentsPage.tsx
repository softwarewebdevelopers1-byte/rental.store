import { useAgents } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import type { MarketAgent } from "../../types/user";

export default function AgentsPage() {
  const { data, loading } = useAgents();

  const columns: Column<MarketAgent>[] = [
    { key: "name", label: "Name", render: (a) => a.name },
    { key: "email", label: "Email", render: (a) => a.email },
    {
      key: "joined",
      label: "Joined",
      render: (a) => new Date(a.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Market Agents"
        subtitle="Create and manage agent invitations from the Invitations page."
        actions={
          <Link to="/admin/invitations">
            <Button>Invitations</Button>
          </Link>
        }
      />
      <DataTable<MarketAgent>
        rows={data}
        columns={columns}
        keyFor={(a) => a.id}
        loading={loading}
        actions={(a) => (
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Link to={`/admin/users/${a.id}`}>
              <Button size="sm" variant="secondary">
                View
              </Button>
            </Link>
          </div>
        )}
      />
    </div>
  );
}
