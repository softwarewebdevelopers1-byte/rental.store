import { PriceDisplay } from "../common/PriceDisplay";
import type {
  CartItem as CartItemType,
  Pack,
  Product,
} from "../../types/marketplace";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
  product?: Product;
  pack?: Pack;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  product,
  pack,
  onUpdateQty,
  onRemove,
}: CartItemProps) {
  const source = item.kind === "PRODUCT" ? product : pack;
  if (!source) return null;
  const name = item.kind === "PRODUCT" ? product!.name : pack!.name;
  const image = item.kind === "PRODUCT" ? product!.imageUrl : pack!.imageUrl;
  const price = item.kind === "PRODUCT" ? product!.price : pack!.price;

  return (
    <div className={styles.row}>
      <img src={image} alt="" className={styles.image} />
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.kind}>
          {item.kind === "PRODUCT" ? "Product" : "Pack"}
        </div>
        <div className={styles.price}>
          <PriceDisplay amount={price} size="sm" />
        </div>
      </div>
      <div className={styles.qty}>
        <button
          className={styles.qtyBtn}
          onClick={() => onUpdateQty(Math.max(1, item.quantity - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className={styles.qtyValue}>{item.quantity}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => onUpdateQty(item.quantity + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className={styles.subtotal}>
        <PriceDisplay amount={price * item.quantity} size="sm" />
      </div>
      <button
        className={styles.remove}
        onClick={onRemove}
        aria-label="Remove item"
      >
        ×
      </button>
    </div>
  );
}
