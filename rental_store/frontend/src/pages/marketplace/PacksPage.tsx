import { useState } from "react";
import { Link } from "react-router-dom";
import { usePacks, useProducts } from "../../hooks/useMarketplace";
import { SearchBar } from "../../components/common/SearchBar";
import { Button } from "../../components/common/Button";
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
    <div className={`${styles.wrap} ${styles.listingPage}`}>
      <header className={styles.listingHero}>
        <div>
          <p className={styles.eyebrow}>Hostelix marketplace</p>
          <h1>Packs</h1>
          <p>Ready-made bundles that make move-in simple.</p>
        </div>
        <Link to="/marketplace/products">
          <Button variant="secondary">Browse products</Button>
        </Link>
      </header>
      <div className={styles.listingToolbar}>
        <div className={styles.listingSearch}>
          <SearchBar value={q} onChange={setQ} placeholder="Search packs" />
        </div>
        <span className={styles.listingCount}>{loading ? "Loading packs…" : `${data.length} pack${data.length === 1 ? "" : "s"}`}</span>
      </div>
      {loading ? (
        <div className={styles.gridPacks}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={320} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="No packs found" />
      ) : (
        <div className={styles.gridPacks}>
          {data.map((p) => (
            <PackCard key={p.id} pack={p} productsById={productsById} />
          ))}
        </div>
      )}
    </div>
  );
}
