import { useParams, Link } from "react-router-dom";
import { useProduct } from "../../hooks/useMarketplace";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./ProductDetailsPage.module.css";

export default function ProductDetailsPage() {
  const { productId = "" } = useParams<{ productId: string }>();
  const { data, loading } = useProduct(productId);
  const { add } = useCart();
  const { show } = useToast();
  const { user } = useAuth();

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!data) return <EmptyState title="Product not found" />;

  return (
    <div className={styles.wrap}>
      <img src={data.imageUrl} alt={data.name} className={styles.image} />
      <div className={styles.info}>
        <Link to="/marketplace/products" className={styles.back}>
          ← Back to products
        </Link>
        <h1 className={styles.name}>{data.name}</h1>
        <p className={styles.description}>{data.description}</p>
        <PriceDisplay amount={data.price} size="lg" />
        <div className={styles.actions}>
          <Button
            size="lg"
            disabled={!user}
            onClick={() => {
              add({ kind: "PRODUCT", refId: data.id, quantity: 1 });
              show("Added to cart.", "success");
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
