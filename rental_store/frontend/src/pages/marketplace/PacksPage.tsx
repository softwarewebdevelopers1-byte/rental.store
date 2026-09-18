import { useState } from "react";
import { usePacks, useProducts } from "../../hooks/useMarketplace";
import { PageHeader } from "../../components/layout/PageHeader";
import { SearchBar } from "../../components/common/SearchBar";
import { PackCard } from "../../components/marketplace/PackCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./MarketplaceHome.module.css";

export default function PacksPage() {
  const [q, setQ] = useState("");
  const { data, loading } = usePacks({ q });
  const { data: products } = useProducts();

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Packs"
        subtitle="Bundles of essentials at a discount."
      />
      <div style={{ maxWidth: 420 }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search packs" />
      </div>
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={320} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="No packs found" />
      ) : (
        <div className={styles.grid}>
          {data.map((p) => (
            <PackCard key={p.id} pack={p} productsById={productsById} />
          ))}
        </div>
      )}
    </div>
  );
}
