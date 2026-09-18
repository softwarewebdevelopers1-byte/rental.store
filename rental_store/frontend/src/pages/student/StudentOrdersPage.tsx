import { useAuth } from "../../hooks/useAuth";
import { useStudentOrders } from "../../hooks/useOrders";
import { useStudentConflicts } from "../../hooks/useConflicts";
import { PageHeader } from "../../components/layout/PageHeader";
import { OrderCard } from "../../components/marketplace/OrderCard";
import { ConflictCard } from "../../components/marketplace/ConflictCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./StudentOrdersPage.module.css";

export default function StudentOrdersPage() {
  const { user } = useAuth();
  const { data: orders, loading } = useStudentOrders(user?.id ?? "");
  const { data: conflicts } = useStudentConflicts(user?.id ?? "");

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="My orders"
        subtitle="Track your marketplace purchases."
        actions={
          <>
            <Link to="/marketplace/cart">
              <Button variant="secondary">View cart</Button>
            </Link>
            <Link to="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={140} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your marketplace orders will show up here."
          action={
            <Link to="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} to={`/student/orders/${o.id}`} />
          ))}
        </div>
      )}

      {conflicts.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Conflicts</h2>
          <div className={styles.grid}>
            {conflicts.map((c) => (
              <ConflictCard key={c.id} conflict={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
