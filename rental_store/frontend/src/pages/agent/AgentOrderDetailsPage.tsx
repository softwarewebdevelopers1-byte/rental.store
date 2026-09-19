import { useParams, Link } from "react-router-dom";
import { useOrder } from "../../hooks/useOrders";
import { useToast } from "../../hooks/useToast";
import { orderService } from "../../services/orderService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { OrderTimeline } from "../../components/marketplace/OrderTimeline";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import type { OrderStatus } from "../../types/order";
import styles from "./AgentOrderDetailsPage.module.css";

export default function AgentOrderDetailsPage() {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const { show } = useToast();
  const { data: order, loading, reload } = useOrder(orderId, "agent");

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!order) return <EmptyState title="Order not found" />;

  async function advance(status: OrderStatus) {
    await orderService.advanceStatus(order!.id, status);
    show(`Marked as ${status.toLowerCase().replace(/_/g, " ")}.`, "success");
    await reload();
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Order #${order.id.slice(-6).toUpperCase()}`}
        subtitle={new Date(order.createdAt).toLocaleString()}
        actions={
          <Link to="/agent/orders">
            <Button variant="secondary">Back to orders</Button>
          </Link>
        }
      />

      <div className={styles.grid}>
        <Card title="Status">
          <StatusBadge status={order.status} />
          <div style={{ marginTop: "var(--space-4)" }}>
            <OrderTimeline order={order} />
          </div>
        </Card>

        <Card title="Items">
          <ul className={styles.items}>
            {order.items.map((it, idx) => (
              <li key={`${it.refId}-${idx}`} className={styles.item}>
                <span>
                  {it.name} ×{it.quantity}
                </span>
                <PriceDisplay amount={it.unitPrice * it.quantity} size="sm" />
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>Total</span>
            <PriceDisplay amount={order.total} size="lg" />
          </div>
        </Card>
      </div>

      <div className={styles.actions}>
        {order.status === "PAID" && (
          <Button onClick={() => advance("PREPARING")}>Start preparing</Button>
        )}
        {order.status === "PREPARING" && (
          <Button onClick={() => advance("READY")}>Mark ready</Button>
        )}
        {order.status === "READY" && (
          <Button onClick={() => advance("OUT_FOR_DELIVERY")}>
            Out for delivery
          </Button>
        )}
        {order.status === "OUT_FOR_DELIVERY" && (
          <Button onClick={() => advance("DELIVERED")}>Mark delivered</Button>
        )}
      </div>
    </div>
  );
}
