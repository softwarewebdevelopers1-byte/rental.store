import type { ReactNode } from "react";
import { StatCard } from "./StatCard";
import styles from "./StatGrid.module.css";

interface StatGridItem {
  label: string;
  value: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}

export function StatGrid({ items }: { items: StatGridItem[] }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <StatCard
          key={it.label}
          label={it.label}
          value={it.value}
          tone={it.tone}
        />
      ))}
    </div>
  );
}
