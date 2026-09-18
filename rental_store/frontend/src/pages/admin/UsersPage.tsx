import { useState } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../../hooks/useAdmin";
import { useToast } from "../../hooks/useToast";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Badge } from "../../components/common/Badge";
import type { User, UserRole } from "../../types/user";
import { ROLE_LABELS } from "../../constants/roles";
import styles from "./UsersPage.module.css";

export default function UsersPage() {
  const { show } = useToast();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const { data, loading, reload } = useUsers({ q, role: role || undefined });

  async function toggleActive(u: User) {
    await adminService.setUserActive(u.id, !u.active);
    show(`${u.name} ${!u.active ? "activated" : "deactivated"}.`, "success");
    await reload();
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      render: (u) => (
        <Link to={`/admin/users/${u.id}`} className={styles.link}>
          {u.name}
        </Link>
      ),
    },
    { key: "email", label: "Email", render: (u) => u.email },
    {
      key: "role",
      label: "Role",
      render: (u) => <Badge tone="info">{ROLE_LABELS[u.role]}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (u) => <StatusBadge status={u.active ? "ACTIVE" : "INACTIVE"} />,
    },
    {
      key: "createdAt",
      label: "Joined",
      hideOnMobile: true,
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="All accounts on the platform." />
      <DataTable<User>
        rows={data}
        columns={columns}
        keyFor={(u) => u.id}
        loading={loading}
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search by name or email"
        filters={[
          {
            id: "role",
            label: "Role",
            value: role,
            onChange: (v) => setRole(v as UserRole | ""),
            options: [
              { value: "", label: "All roles" },
              { value: "STUDENT", label: "Students" },
              { value: "LANDLORD", label: "Landlords" },
              { value: "CARETAKER", label: "Caretakers" },
              { value: "MARKET_AGENT", label: "Market agents" },
              { value: "ADMIN", label: "Admins" },
            ],
          },
        ]}
        actions={(u) => (
          <div className={styles.actions}>
            <Link to={`/admin/users/${u.id}`}>
              <Button size="sm" variant="secondary">
                View
              </Button>
            </Link>
            <Button
              size="sm"
              variant={u.active ? "danger" : "success"}
              onClick={() => void toggleActive(u)}
            >
              {u.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        )}
      />
    </div>
  );
}
