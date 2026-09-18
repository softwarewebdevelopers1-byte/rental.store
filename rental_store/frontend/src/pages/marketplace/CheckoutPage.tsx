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
import { MpesaPaymentModal } from "../../components/payments/MpesaPaymentModal";
import type { OrderItem } from "../../types/order";
import styles from "./CartPage.module.css";

function generateMpesaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const { data: packs } = usePacks();
  const [placing, setPlacing] = useState(false);
  const [open, setOpen] = useState(false);

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

  async function handleMpesaConfirm({ phone }: { phone: string; mpesaCode: string }) {
    setPlacing(true);
    try {
      const code = generateMpesaCode();
      const order = await orderService.create({
        studentId: user!.id,
        agentId,
        items: orderItems,
        total,
      });
      await orderService.payOrder(order.id, { phone, mpesaCode: code });
      clear();
      show(`M-Pesa payment confirmed — ${code}`, "success");
      navigate(`/student/orders/${order.id}`);
    } catch (e) {
      show(
        e instanceof Error ? e.message : "Order failed",
        "error",
      );
    } finally {
      setPlacing(false);
      setOpen(false);
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
            You will receive an M-Pesa STK push to authorise the payment.
          </p>
          <Button
            fullWidth
            size="lg"
            onClick={() => setOpen(true)}
            loading={placing}
          >
            Pay with M-Pesa
          </Button>
        </aside>
      </div>
      <MpesaPaymentModal
        open={open}
        amount={total}
        phone={user.phone}
        onClose={() => {
          if (!placing) setOpen(false);
        }}
        onConfirm={handleMpesaConfirm}
      />
    </div>
  );
}