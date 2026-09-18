import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { PriceDisplay } from "../common/PriceDisplay";
import { useCart } from "../../hooks/useCart";
import type { Pack, Product } from "../../types/marketplace";
import styles from "./PackCard.module.css";

interface PackCardProps {
  pack: Pack;
  productsById?: Record<string, Product>;
}

export function PackCard({ pack, productsById = {} }: PackCardProps) {
  const { add } = useCart();
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
          <PriceDisplay amount={pack.price} />
          <Button
            size="sm"
            onClick={() => add({ kind: "PACK", refId: pack.id, quantity: 1 })}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
