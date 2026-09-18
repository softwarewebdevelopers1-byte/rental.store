import { useCaretakers } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import type { Caretaker } from "../../types/user";

export default function CaretakersPage() {
  const { data, loading } = useCaretakers();

  const columns: Column<Caretaker>[] = [
    { key: "name", label: "Name", render: (c) => c.name },
    { key: "email", label: "Email", render: (c) => c.email },
    {
      key: "hostels",
      label: "Assigned hostels",
      render: (c) => c.assignedHostelIds.length,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Caretakers"
        subtitle="All caretakers on the platform."
      />
      <DataTable<Caretaker>
        rows={data}
        columns={columns}
        keyFor={(c) => c.id}
        loading={loading}
        actions={(c) => (
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Link to={`/admin/users/${c.id}`}>
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
