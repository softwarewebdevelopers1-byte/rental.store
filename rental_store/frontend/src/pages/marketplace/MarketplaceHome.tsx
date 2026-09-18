import { Link } from "react-router-dom";
import { useProducts, usePacks } from "../../hooks/useMarketplace";
import { PageHeader } from "../../components/layout/PageHeader";
import { ProductCard } from "../../components/marketplace/ProductCard";
import { PackCard } from "../../components/marketplace/PackCard";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./MarketplaceHome.module.css";

export default function MarketplaceHome() {
  const { data: products, loading: loadingProducts } = useProducts();
  const { data: packs, loading: loadingPacks } = usePacks();

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Marketplace"
        subtitle="Buy hostel essentials — individually or as packs."
        actions={
          <>
            <Link to="/marketplace/products">
              <Button variant="secondary">All products</Button>
            </Link>
            <Link to="/marketplace/packs">
              <Button>All packs</Button>
            </Link>
          </>
        }
      />

      <section>
        <div className={styles.head}>
          <h2 className={styles.title}>Packs</h2>
          <Link to="/marketplace/packs" className={styles.seeAll}>
            See all
          </Link>
        </div>
        {loadingPacks ? (
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={280} radius="var(--radius-lg)" />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <EmptyState title="No packs yet" />
        ) : (
          <div className={styles.grid}>
            {packs.slice(0, 3).map((p) => (
              <PackCard key={p.id} pack={p} productsById={productsById} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className={styles.head}>
          <h2 className={styles.title}>Popular products</h2>
          <Link to="/marketplace/products" className={styles.seeAll}>
            See all
          </Link>
        </div>
        {loadingProducts ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={260} radius="var(--radius-lg)" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" />
        ) : (
          <div className={styles.grid}>
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
