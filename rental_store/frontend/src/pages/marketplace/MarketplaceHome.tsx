import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts, usePacks } from "../../hooks/useMarketplace";
import { ProductCard } from "../../components/marketplace/ProductCard";
import { PackCard } from "../../components/marketplace/PackCard";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./MarketplaceHome.module.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export default function MarketplaceHome() {
  const { data: products, loading: loadingProducts } = useProducts();
  const { data: packs, loading: loadingPacks } = usePacks();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // ProductsPage has no URL query reader yet, so preserve the existing route contract.
    navigate("/marketplace/products");
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Hostelix marketplace</p>
          <h1>Everything for hostel life.</h1>
          <p>Shop practical essentials and ready-made packs, delivered with confidence.</p>
          <form className={styles.search} onSubmit={handleSearch}>
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products and packs"
              aria-label="Search products and packs"
            />
            <button type="submit">Search</button>
          </form>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <span>STOCK UP</span>
          <strong>SETTLE IN</strong>
        </div>
      </section>

      <section className={styles.promiseRow} aria-label="Marketplace benefits">
        <div><strong>Useful essentials</strong><span>Made for student life</span></div>
        <div><strong>Simple checkout</strong><span>Secure M-Pesa payments</span></div>
        <div><strong>Ready-made packs</strong><span>Save time and money</span></div>
      </section>

      <section className={styles.section}>
        <div className={styles.head}>
          <div>
            <p className={styles.sectionEyebrow}>Start smart</p>
            <h2 className={styles.title}>Packs</h2>
          </div>
          <Link to="/marketplace/packs" className={styles.seeAll}>See all →</Link>
        </div>
        {loadingPacks ? (
          <div className={styles.gridPacks}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={360} radius="var(--radius-lg)" />)}
          </div>
        ) : packs.length === 0 ? (
          <EmptyState title="No packs yet" />
        ) : (
          <div className={styles.gridPacks}>
            {packs.slice(0, 3).map((pack) => <PackCard key={pack.id} pack={pack} productsById={productsById} />)}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.head}>
          <div>
            <p className={styles.sectionEyebrow}>Everyday favourites</p>
            <h2 className={styles.title}>Popular products</h2>
          </div>
          <Link to="/marketplace/products" className={styles.seeAll}>See all →</Link>
        </div>
        {loadingProducts ? (
          <div className={styles.gridProducts}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={350} radius="var(--radius-lg)" />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" />
        ) : (
          <div className={styles.gridProducts}>
            {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className={styles.bottomCta}>
        <div>
          <p className={styles.sectionEyebrow}>Make move-in easy</p>
          <h2>Small things make a place feel like home.</h2>
        </div>
        <Link to="/marketplace/products"><Button>Browse products →</Button></Link>
      </section>
    </div>
  );
}
