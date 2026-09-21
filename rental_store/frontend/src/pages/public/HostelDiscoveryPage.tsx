import { useMemo, useState } from "react";
import { Button } from "../../components/common/Button";
import { HostelCard } from "../../components/hostel/HostelCard";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import { useHostels } from "../../hooks/useHostels";
import type { HostelFilters } from "../../services/hostelService";
import styles from "./HostelDiscoveryPage.module.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function EmptyIllustration() {
  return (
    <svg className={styles.emptyIllustration} viewBox="0 0 160 120" aria-hidden="true">
      <rect x="25" y="25" width="110" height="76" rx="10" />
      <path d="m42 78 20-20 16 15 12-12 28 27" />
      <circle cx="61" cy="46" r="7" />
    </svg>
  );
}

export default function HostelDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState<HostelFilters["sortBy"]>("rating-desc");
  const [vacantOnly, setVacantOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = useMemo<HostelFilters>(
    () => ({
      query: query || undefined,
      location: location || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating !== "0" ? Number(minRating) : undefined,
      vacantOnly,
      sortBy,
    }),
    [location, maxPrice, minPrice, minRating, query, sortBy, vacantOnly],
  );
  const { data, loading, error, reload } = useHostels(filters);
  const locations = useMemo(
    () => Array.from(new Set(data.map((hostel) => hostel.location))).sort(),
    [data],
  );

  function clearFilters() {
    setQuery("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("0");
    setSortBy("rating-desc");
    setVacantOnly(false);
  }

  const filterControls = (
    <div className={styles.filterControls}>
      <label className={`${styles.control} ${styles.searchControl}`}>
        <span className={styles.visuallyHidden}>Search hostels</span>
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search hostels"
          aria-label="Search hostels"
        />
      </label>
      <label className={styles.control}>
        <span className={styles.visuallyHidden}>Location</span>
        <select value={location} onChange={(event) => setLocation(event.target.value)}>
          <option value="">All locations</option>
          {locations.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <div className={`${styles.control} ${styles.priceControl}`}>
        <label>
          <span className={styles.visuallyHidden}>Minimum price</span>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
          />
        </label>
        <span aria-hidden="true">–</span>
        <label>
          <span className={styles.visuallyHidden}>Maximum price</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </label>
      </div>
      <label className={styles.control}>
        <span className={styles.visuallyHidden}>Minimum rating</span>
        <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
          <option value="0">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </label>
      <label className={styles.control}>
        <span className={styles.visuallyHidden}>Sort hostels</span>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as HostelFilters["sortBy"])}>
          <option value="rating-desc">Top rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
      <label className={styles.toggle}>
        <input type="checkbox" checked={vacantOnly} onChange={(event) => setVacantOnly(event.target.checked)} />
        <span className={styles.toggleTrack} aria-hidden="true"><span /></span>
        <span>Vacant only</span>
      </label>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <header className={styles.pageIntro}>
        <div>
          <p className={styles.eyebrow}>Find your next address</p>
          <h1>Hostels made easy to find.</h1>
          <p>Compare verified stays, transparent prices, and available rooms in one place.</p>
        </div>
      </header>

      <button className={styles.mobileFilterButton} type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
        <span><SearchIcon /> Filters</span>
        <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
      </button>
      <section className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`} aria-label="Hostel filters">
        {filterControls}
        <button type="button" className={styles.clearLink} onClick={clearFilters}>Clear filters</button>
      </section>

      <main className={styles.results}>
        <div className={styles.resultsHeader}>
          <p>{loading ? "Finding hostels…" : `${data.length} hostel${data.length === 1 ? "" : "s"} found`}</p>
          <label className={styles.resultSort}>
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as HostelFilters["sortBy"])}>
              <option value="rating-desc">Top rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div className={styles.skeleton} key={index}>
                <Skeleton height={210} />
                <Skeleton height={22} width="70%" />
                <Skeleton height={16} width="45%" />
                <Skeleton height={18} width="55%" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={reload} />
        ) : data.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyIllustration />
            <h2>No hostels match your filters</h2>
            <p>Try widening your search or clearing one of the filters.</p>
            <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {data.map((hostel) => <HostelCard key={hostel.id} hostel={hostel} />)}
          </div>
        )}
      </main>
    </div>
  );
}
