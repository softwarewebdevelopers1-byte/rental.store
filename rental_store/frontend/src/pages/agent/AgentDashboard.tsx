import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAgentOrders } from "../../hooks/useOrders";
import { useAgentConflicts } from "../../hooks/useConflicts";
import { useProducts, usePacks } from "../../hooks/useMarketplace";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { OrderCard } from "../../components/marketplace/OrderCard";
import styles from "./AgentDashboard.module.css";

export default function AgentDashboard() {
  const { user } = useAuth();
  const { data: orders, loading: loadingOrders } = useAgentOrders(
    user?.id ?? "",
  );
  const { data: conflicts, loading: loadingConflicts } = useAgentConflicts(
    user?.id ?? "",
  );
  const { data: products } = useProducts({
    agentId: user?.id,
    activeOnly: false,
  });
  const { data: packs } = usePacks({ agentId: user?.id, activeOnly: false });

  const stats = {
    newOrders: orders.filter((o) => o.status === "PAID").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
    delivered: orders.filter(
      (o) => o.status === "DELIVERED" || o.status === "RECEIVED",
    ).length,
    conflicts: conflicts.filter(
      (c) => c.status !== "RESOLVED" && c.status !== "REJECTED",
    ).length,
  };

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Welcome${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Manage your marketplace."
        actions={
          <>
            <Link to="/agent/products/create">
              <Button variant="secondary">+ Product</Button>
            </Link>
            <Link to="/agent/packs">
              <Button>+ Pack</Button>
            </Link>
          </>
        }
      />

      <section className={styles.statsGrid}>
        <StatCard
          label="New orders"
          value={stats.newOrders}
          tone={stats.newOrders > 0 ? "warning" : "default"}
        />
        <StatCard label="Preparing" value={stats.preparing} />
        <StatCard label="Ready" value={stats.ready} tone="success" />
        <StatCard label="Delivered" value={stats.delivered} tone="success" />
        <StatCard
          label="Open conflicts"
          value={stats.conflicts}
          tone={stats.conflicts > 0 ? "danger" : "default"}
        />
      </section>

      <section className={styles.twoCol}>
        <div>
          <h2 className={styles.sectionTitle}>Catalogue</h2>
          <div className={styles.miniGrid}>
            <StatCard label="Products" value={products.length} />
            <StatCard label="Packs" value={packs.length} />
          </div>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Recent orders</h2>
          {loadingOrders ? (
            <Skeleton height={140} radius="var(--radius-lg)" />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className={styles.ordersGrid}>
              {orders.slice(0, 3).map((o) => (
                <OrderCard key={o.id} order={o} to={`/agent/orders/${o.id}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Active conflicts</h2>
        {loadingConflicts ? (
          <Skeleton height={80} radius="var(--radius-lg)" />
        ) : stats.conflicts === 0 ? (
          <EmptyState title="No active conflicts" />
        ) : (
          <Link to="/agent/conflicts" className={styles.conflictLink}>
            {stats.conflicts} open conflict{stats.conflicts === 1 ? "" : "s"} ·
            review
          </Link>
        )}
      </section>
    </div>
  );
}
