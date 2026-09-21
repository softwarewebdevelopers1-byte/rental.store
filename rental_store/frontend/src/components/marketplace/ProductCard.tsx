import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { PriceDisplay } from "../common/PriceDisplay";
import { MpesaPaymentModal } from "../payments/MpesaPaymentModal";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { orderService } from "../../services/orderService";
import type { Product } from "../../types/marketplace";
import styles from "./ProductCard.module.css";

function generateMpesaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { show } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleBuyNow(phone: string) {
    if (!user) return;
    setSubmitting(true);
    try {
      const code = generateMpesaCode();
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
      await orderService.payOrder(order.id, { phone, mpesaCode: code });
      show(`M-Pesa payment confirmed — ${code}`, "success");
      setOpen(false);
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
              onClick={() => setOpen(true)}
              disabled={!user}
            >
              Buy now
            </Button>
          </div>
        </div>
      </div>
      <MpesaPaymentModal
        open={open}
        amount={product.price}
        phone={user?.phone}
        onClose={() => {
          if (!submitting) setOpen(false);
        }}
        onConfirm={async ({ phone }) => {
          await handleBuyNow(phone);
        }}
      />
    </article>
  );
}
