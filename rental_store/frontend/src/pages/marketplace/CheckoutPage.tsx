import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useProducts, usePacks } from "../../hooks/useMarketplace";
import { orderService } from "../../services/orderService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { EmptyState } from "../../components/common/EmptyState";
import type { OrderItem } from "../../types/order";
import styles from "./CartPage.module.css";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const { data: packs } = usePacks();
  const [placing, setPlacing] = useState(false);

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const packsById = Object.fromEntries(packs.map((p) => [p.id, p]));

  if (!user) return null;
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Your cart is empty."
        action={
          <Link to="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        }
      />
    );
  }

  const orderItems: OrderItem[] = items.map((it) => {
    if (it.kind === "PRODUCT") {
      const p = productsById[it.refId];
      return {
        kind: "PRODUCT",
        refId: it.refId,
        name: p?.name ?? "Product",
        unitPrice: p?.price ?? 0,
        quantity: it.quantity,
      };
    }
    const p = packsById[it.refId];
    return {
      kind: "PACK",
      refId: it.refId,
      name: p?.name ?? "Pack",
      unitPrice: p?.price ?? 0,
      quantity: it.quantity,
    };
  });

  const total = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const agentId =
    productsById[orderItems[0].refId]?.agentId ??
    packsById[orderItems[0].refId]?.agentId ??
    "";

  async function placeOrder() {
    if (!user) return;
    setPlacing(true);
    try {
      const order = await orderService.create({
        studentId: user.id,
        agentId,
        items: orderItems,
        total,
      });
      clear();
      show("Order placed successfully.", "success");
      navigate(`/student/orders/${order.id}`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Order failed", "error");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <PageHeader title="Checkout" subtitle="Review and place your order." />
      <div className={styles.grid}>
        <Card title="Order items">
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {orderItems.map((it) => (
              <li
                key={`${it.kind}-${it.refId}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--text-sm)",
                }}
              >
                <span>
                  {it.name} ×{it.quantity}
                </span>
                <PriceDisplay amount={it.unitPrice * it.quantity} size="sm" />
              </li>
            ))}
          </ul>
        </Card>
        <aside className={styles.summary}>
          <h3 className={styles.summaryTitle}>Total</h3>
          <PriceDisplay amount={total} size="lg" />
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
            }}
          >
            Prototype: no payment provider. Order is created as PAID.
          </p>
          <Button fullWidth size="lg" onClick={placeOrder} loading={placing}>
            Place order
          </Button>
        </aside>
      </div>
    </div>
  );
}
