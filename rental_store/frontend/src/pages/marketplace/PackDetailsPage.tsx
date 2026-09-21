import { Link, useParams } from "react-router-dom";
import { usePack, useProducts } from "../../hooks/useMarketplace";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./ProductDetailsPage.module.css";

export default function PackDetailsPage() {
  const { packId = "" } = useParams<{ packId: string }>();
  const { data, loading } = usePack(packId);
  const { data: products } = useProducts();
  const { add } = useCart();
  const { show } = useToast();
  const { user } = useAuth();

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!data) return <EmptyState title="Pack not found" />;

  return (
    <div className={styles.wrap}>
      <img src={data.imageUrl} alt={data.name} className={styles.image} />
      <div className={styles.info}>
        <Link to="/marketplace/packs" className={styles.back}>
          ← Back to packs
        </Link>
        <h1 className={styles.name}>{data.name}</h1>
        <p className={styles.description}>{data.description}</p>
        <div>
          <h3
            style={{
              marginBottom: "var(--space-2)",
              fontSize: "var(--text-base)",
            }}
          >
            Includes
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.items.map((it) => (
              <li
                key={it.productId}
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                • {productsById[it.productId]?.name ?? it.productId}
                {it.quantity > 1 && ` ×${it.quantity}`}
              </li>
            ))}
          </ul>
        </div>
        <PriceDisplay amount={data.price} size="lg" />
        <div className={styles.actions}>
          <Button
            size="lg"
            disabled={!user}
            onClick={() => {
              add({ kind: "PACK", refId: data.id, quantity: 1 });
              show("Added pack to cart.", "success");
            }}
          >
            Add to Cart
          </Button>
          <Link to="/marketplace/cart">
            <Button variant="secondary" size="lg">
              View cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
