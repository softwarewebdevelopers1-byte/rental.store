import { formatCurrency } from "../../utils/formatCurrency";
import styles from "./PriceDisplay.module.css";

interface PriceDisplayProps {
  amount: number;
  suffix?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
  amount,
  suffix,
  size = "md",
}: PriceDisplayProps) {
  return (
    <span className={`${styles.price} ${styles[size]}`}>
      {formatCurrency(amount)}
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  );
}
