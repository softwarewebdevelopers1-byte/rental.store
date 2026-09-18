import styles from "./RatingStars.module.css";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
}

export function RatingStars({ value, count, size = "sm" }: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      className={`${styles.wrap} ${styles[size]}`}
      aria-label={`Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? styles.full : styles.empty}>
          ★
        </span>
      ))}
      <span className={styles.value}>{value.toFixed(1)}</span>
      {count !== undefined && <span className={styles.count}>({count})</span>}
    </span>
  );
}
