import { useState } from "react";
import { useProducts } from "../../hooks/useMarketplace";
import { PageHeader } from "../../components/layout/PageHeader";
import { SearchBar } from "../../components/common/SearchBar";
import { ProductCard } from "../../components/marketplace/ProductCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import styles from "./MarketplaceHome.module.css";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useProducts({ q });

  return (
    <div className={styles.wrap}>
      <PageHeader title="Products" subtitle="Browse all hostel essentials." />
      <div style={{ maxWidth: 420 }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search products" />
      </div>
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={260} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different search."
        />
      ) : (
        <div className={styles.grid}>
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
