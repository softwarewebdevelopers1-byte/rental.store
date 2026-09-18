import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAgentOrders } from "../../hooks/useOrders";
import { PageHeader } from "../../components/layout/PageHeader";
import { OrderCard } from "../../components/marketplace/OrderCard";
import { Tabs, type TabItem } from "../../components/common/Tabs";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import type { OrderStatus } from "../../types/order";
import styles from "../student/StudentOrdersPage.module.css";

type FilterId = "all" | OrderStatus;

export default function AgentOrdersPage() {
  const { user } = useAuth();
  const { data, loading } = useAgentOrders(user?.id ?? "");
  const [filter, setFilter] = useState<FilterId>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.length };
    data.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [data]);

  const filtered =
    filter === "all" ? data : data.filter((o) => o.status === filter);

  const tabs: TabItem[] = [
    { id: "all", label: "All", badge: counts.all },
    { id: "PAID", label: "New", badge: counts.PAID ?? 0 },
    { id: "PREPARING", label: "Preparing", badge: counts.PREPARING ?? 0 },
    { id: "READY", label: "Ready", badge: counts.READY ?? 0 },
    { id: "DELIVERED", label: "Delivered", badge: counts.DELIVERED ?? 0 },
    { id: "CONFLICT", label: "Conflict", badge: counts.CONFLICT ?? 0 },
  ];

  return (
    <div className={styles.wrap}>
      <PageHeader title="Orders" subtitle="Manage incoming orders." />
      <Tabs
        items={tabs}
        activeId={filter}
        onChange={(id) => setFilter(id as FilterId)}
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders here" />
      ) : (
        <div className={styles.grid}>
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} to={`/agent/orders/${o.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
