import { useStudents } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import type { Student } from "../../types/user";

export default function StudentsPage() {
  const { data, loading } = useStudents();

  const columns: Column<Student>[] = [
    { key: "name", label: "Name", render: (s) => s.name },
    { key: "email", label: "Email", render: (s) => s.email },
    {
      key: "membership",
      label: "Membership",
      render: (s) => <StatusBadge status={s.membershipStatus} />,
    },
    {
      key: "hostel",
      label: "Hostel",
      render: (s) => s.hostelId ?? s.requestedHostelId ?? "—",
    },
  ];

  return (
    <div>
      <PageHeader title="Students" subtitle="All student accounts." />
      <DataTable<Student>
        rows={data}
        columns={columns}
        keyFor={(s) => s.id}
        loading={loading}
        actions={(s) => (
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Link to={`/admin/users/${s.id}`}>
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
