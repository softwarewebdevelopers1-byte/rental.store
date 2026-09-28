import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { PriceDisplay } from "../common/PriceDisplay";
import { PayHeroOrderPaymentModal } from "../payments/PayHeroOrderPaymentModal";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { orderService } from "../../services/orderService";
import type { Product } from "../../types/marketplace";
import type { Order } from "../../types/order";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { show } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  async function handleBuyNow() {
    if (!user) return;
    setSubmitting(true);
    try {
      const order = await orderService.create({
        studentId: user.id,
        agentId: product.agentId,
        items: [
          {
            kind: "PRODUCT",
            refId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: 1,
          },
        ],
        total: product.price,
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
      <Link
        to={`/marketplace/products/${product.id}`}
        className={styles.imageLink}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
      </Link>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <PriceDisplay amount={product.price} />
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
                add({ kind: "PRODUCT", refId: product.id, quantity: 1 });
                show(`Added ${product.name} to cart.`, "success");
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
        key={`${pendingOrder?.id ?? "new"}-${open ? "open" : "closed"}`}
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
