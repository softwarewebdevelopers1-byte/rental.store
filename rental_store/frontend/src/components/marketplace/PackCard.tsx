import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { PriceDisplay } from "../common/PriceDisplay";
import { PayHeroOrderPaymentModal } from "../payments/PayHeroOrderPaymentModal";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { orderService } from "../../services/orderService";
import type { Pack, Product } from "../../types/marketplace";
import type { Order } from "../../types/order";
import styles from "./PackCard.module.css";

export function PackCard({
  pack,
  productsById = {},
}: {
  pack: Pack;
  productsById?: Record<string, Product>;
}) {
  const { add } = useCart();
  const { show } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  async function handleBuyNow() {
    if (!user) return;
    if (!user.phone) {
      show("Add your phone number to your profile before paying.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderService.create({
        studentId: user.id,
        agentId: pack.agentId,
        items: [
          {
            kind: "PACK",
            refId: pack.id,
            name: pack.name,
            unitPrice: pack.price,
            quantity: 1,
          },
        ],
        total: pack.price,
      });
      setPendingOrder(order);
      setOpen(true);
    } catch (e) {
      show(
        e instanceof Error ? e.message : "Purchase failed",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className={styles.card}>
      <Link to={`/marketplace/packs/${pack.id}`} className={styles.imageLink}>
        <img
          src={pack.imageUrl}
          alt={pack.name}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.badge}>PACK</span>
      </Link>
      <div className={styles.body}>
        <h3 className={styles.name}>{pack.name}</h3>
        <p className={styles.description}>{pack.description}</p>
        <ul className={styles.items}>
          {pack.items.slice(0, 4).map((it) => (
            <li key={it.productId} className={styles.item}>
              • {productsById[it.productId]?.name ?? it.productId}
              {it.quantity > 1 && ` ×${it.quantity}`}
            </li>
          ))}
          {pack.items.length > 4 && (
            <li className={styles.item}>+{pack.items.length - 4} more</li>
          )}
        </ul>
        <div className={styles.footer}>
          <div className={styles.priceRow}>
            <PriceDisplay amount={pack.price} />
          </div>
          <div className={styles.actions}>
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path d="M4 5h2l1.5 9h9.8l2-6.5H7.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="19" r="1.2" fill="currentColor" />
                  <circle cx="17" cy="19" r="1.2" fill="currentColor" />
                  <path d="M14 3v5M11.5 5.5h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              }
              disabled={!user}
              onClick={() => {
                add({ kind: "PACK", refId: pack.id, quantity: 1 });
                show(`Added ${pack.name} to cart.`, "success");
              }}
            >
              Add
            </Button>
            <Button
              size="sm"
              onClick={() => void handleBuyNow()}
              loading={submitting}
              disabled={!user}
            >
              Buy now
            </Button>
          </div>
        </div>
      </div>
      <PayHeroOrderPaymentModal
        open={open}
        order={pendingOrder}
        phone={user?.phone}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          show("Payment confirmed. Your order has been sent to the seller.", "success");
          setOpen(false);
        }}
      />
    </article>
  );
}
