import { useAdminOrders } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { DataTable, type Column } from "../../components/admin/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import type { Order } from "../../types/order";

export default function AdminOrdersPage() {
  const { data, loading } = useAdminOrders();

  const columns: Column<Order>[] = [
    {
      key: "id",
      label: "Order",
      render: (o) => (
        <code
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
        >
          #{o.id.slice(-6).toUpperCase()}
        </code>
      ),
    },
    { key: "student", label: "Student", render: (o) => o.studentId },
    { key: "agent", label: "Agent", render: (o) => o.agentId },
    {
      key: "total",
      label: "Total",
      render: (o) => <PriceDisplay amount={o.total} size="sm" />,
    },
    {
      key: "status",
      label: "Status",
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "created",
      label: "Created",
      hideOnMobile: true,
      render: (o) => new Date(o.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle="All marketplace orders." />
      <DataTable<Order>
        rows={data}
        columns={columns}
        keyFor={(o) => o.id}
        loading={loading}
      />
    </div>
  );
}
