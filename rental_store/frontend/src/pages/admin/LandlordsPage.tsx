import { useLandlords } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import type { Landlord } from "../../types/user";

export default function LandlordsPage() {
  const { data, loading } = useLandlords();

  const columns: Column<Landlord>[] = [
    { key: "name", label: "Name", render: (l) => l.name },
    { key: "email", label: "Email", render: (l) => l.email },
    { key: "hostels", label: "Hostels", render: (l) => l.hostelIds.length },
    {
      key: "verification",
      label: "Verification",
      render: (l) => <StatusBadge status={l.verificationStatus} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Landlords" subtitle="All registered landlords." />
      <DataTable<Landlord>
        rows={data}
        columns={columns}
        keyFor={(l) => l.id}
        loading={loading}
        actions={(l) => (
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Link to={`/admin/users/${l.id}`}>
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
