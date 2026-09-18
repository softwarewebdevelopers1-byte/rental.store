import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { PriceDisplay } from "../common/PriceDisplay";
import { MpesaPaymentModal } from "../payments/MpesaPaymentModal";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { orderService } from "../../services/orderService";
import type { Pack, Product } from "../../types/marketplace";
import styles from "./PackCard.module.css";

function generateMpesaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

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

  async function handleBuyNow(phone: string) {
    if (!user) return;
    setSubmitting(true);
    try {
      const code = generateMpesaCode();
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
              onClick={() => {
                add({ kind: "PACK", refId: pack.id, quantity: 1 });
                show(`Added ${pack.name} to cart.`, "success");
              }}
            >
              Add to cart
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
        amount={pack.price}
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