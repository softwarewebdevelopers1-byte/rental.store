import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useMarketplace";
import { SearchBar } from "../../components/common/SearchBar";
import { Button } from "../../components/common/Button";
import { ProductCard } from "../../components/marketplace/ProductCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import styles from "./MarketplaceHome.module.css";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useProducts({ q });

  return (
    <div className={`${styles.wrap} ${styles.listingPage}`}>
      <header className={styles.listingHero}>
        <div>
          <p className={styles.eyebrow}>Hostelix marketplace</p>
          <h1>Products</h1>
          <p>Browse practical essentials for a comfortable hostel life.</p>
        </div>
        <Link to="/marketplace/packs">
          <Button variant="secondary">Browse packs</Button>
        </Link>
      </header>
      <div className={styles.listingToolbar}>
        <div className={styles.listingSearch}>
          <SearchBar value={q} onChange={setQ} placeholder="Search products" />
        </div>
        <span className={styles.listingCount}>{loading ? "Loading products…" : `${data.length} product${data.length === 1 ? "" : "s"}`}</span>
      </div>
      {loading ? (
        <div className={styles.gridProducts}>
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
        <div className={styles.gridProducts}>
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
