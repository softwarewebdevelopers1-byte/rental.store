import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useProducts, usePacks } from "../../hooks/useMarketplace";
import { PageHeader } from "../../components/layout/PageHeader";
import { CartItem } from "../../components/marketplace/CartItem";
import { Button } from "../../components/common/Button";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { items, updateQty, remove } = useCart();
  const { data: products } = useProducts();
  const { data: packs } = usePacks();

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const packsById = Object.fromEntries(packs.map((p) => [p.id, p]));

  const total = items.reduce((sum, it) => {
    const price =
      it.kind === "PRODUCT"
        ? (productsById[it.refId]?.price ?? 0)
        : (packsById[it.refId]?.price ?? 0);
    return sum + price * it.quantity;
  }, 0);

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Cart"
        subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`}
      />
      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse products and packs to get started."
          action={
            <Link to="/marketplace">
              <Button>Go to Marketplace</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          <div className={styles.list}>
            {items.map((it) => (
              <CartItem
                key={`${it.kind}-${it.refId}`}
                item={it}
                product={
                  it.kind === "PRODUCT" ? productsById[it.refId] : undefined
                }
                pack={it.kind === "PACK" ? packsById[it.refId] : undefined}
                onUpdateQty={(qty) => updateQty(it.kind, it.refId, qty)}
                onRemove={() => remove(it.kind, it.refId)}
              />
            ))}
          </div>
          <aside className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <PriceDisplay amount={total} size="sm" />
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span>Free</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <PriceDisplay amount={total} size="lg" />
            </div>
            <Link to="/marketplace/checkout">
              <Button fullWidth size="lg">
                Checkout
              </Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
