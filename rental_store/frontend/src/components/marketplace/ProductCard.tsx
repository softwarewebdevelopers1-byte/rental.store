import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { PriceDisplay } from "../common/PriceDisplay";
import { useCart } from "../../hooks/useCart";
import type { Product } from "../../types/marketplace";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();
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
          <Button
            size="sm"
            onClick={() =>
              add({ kind: "PRODUCT", refId: product.id, quantity: 1 })
            }
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
