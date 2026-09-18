import { useMemo, useState } from "react";
import { HostelCard } from "../../components/hostel/HostelCard";
import { SearchBar } from "../../components/common/SearchBar";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { useHostels } from "../../hooks/useHostels";
import type { HostelFilters } from "../../services/hostelService";
import styles from "./HostelDiscoveryPage.module.css";

export default function HostelDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [vacantOnly, setVacantOnly] = useState(false);
  const filters = useMemo<HostelFilters>(
    () => ({
      query: query || undefined,
      location: location || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating !== "0" ? Number(minRating) : undefined,
      vacantOnly,
      sortBy: "rating-desc",
    }),
    [location, maxPrice, minPrice, minRating, query, vacantOnly],
  );
  const { data, loading, error, reload } = useHostels(filters);

  return (
    <div className={styles.wrap}>
      <details className={styles.filters} open>
        <summary className={styles.summary}>
          <span>Search &amp; filters</span>
          <span className={styles.summaryToggle} aria-hidden>›</span>
        </summary>
        <h1>Find a hostel</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search hostels" />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Town or campus" />
        <div className={styles.priceRow}>
          <Input label="Min price" type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <Input label="Max price" type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <Select
          label="Minimum rating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          options={[
            { value: "0", label: "Any rating" },
            { value: "4", label: "4+ stars" },
            { value: "4.5", label: "4.5+ stars" },
          ]}
        />
        <label className={styles.checkbox}>
          <input type="checkbox" checked={vacantOnly} onChange={(e) => setVacantOnly(e.target.checked)} />
          Show vacant rooms only
        </label>
      </details>
      <main className={styles.results}>
        <div className={styles.grid}>
          {loading ? Array.from({ length: 6 }).map((_, index) => (
            <div className={styles.skeleton} key={index}>
              <Skeleton height={170} />
              <Skeleton height={24} width="70%" />
              <Skeleton height={18} width="45%" />
            </div>
          )) : error ? (
            <ErrorState description={error} onRetry={reload} />
          ) : data.length === 0 ? (
            <EmptyState title="No hostels found" description="Try changing your search or filters." />
          ) : data.map((hostel) => <HostelCard key={hostel.id} hostel={hostel} />)}
        </div>
      </main>
    </div>
  );
}