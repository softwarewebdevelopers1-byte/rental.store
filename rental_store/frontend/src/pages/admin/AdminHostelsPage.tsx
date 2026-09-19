import { Link } from "react-router-dom";
import { useAdminHostels } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Button } from "../../components/common/Button";
import { RatingStars } from "../../components/common/RatingStars";
import { StatusBadge } from "../../components/common/StatusBadge";
import type { Hostel } from "../../types/hostel";

export default function AdminHostelsPage() {
  const { data, loading } = useAdminHostels();

  const columns: Column<Hostel>[] = [
    {
      key: "name",
      label: "Hostel",
      render: (h) => (
        <Link
          to={`/admin/hostels/${h.id}`}
          style={{ color: "var(--color-primary)" }}
        >
          {h.name}
        </Link>
      ),
    },
    { key: "location", label: "Location", render: (h) => h.location },
    {
      key: "code",
      label: "Code",
      render: (h) => (
        <code
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
        >
          {h.code}
        </code>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (h) => <RatingStars value={h.rating} count={h.reviewCount} />,
    },
    {
      key: "status",
      label: "Status",
      render: (h) => <StatusBadge status={h.active ? "ACTIVE" : "INACTIVE"} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Hostels" subtitle="All hostels on the platform." />
      <DataTable<Hostel>
        rows={data}
        columns={columns}
        keyFor={(h) => h.id}
        loading={loading}
        actions={(h) => (
          <Link to={`/admin/hostels/${h.id}`}>
            <Button size="sm" variant="secondary">
              View
            </Button>
          </Link>
        )}
      />
    </div>
  );
}
