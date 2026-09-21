import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLandlordHostels } from "../../hooks/useLandlord";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import { RatingStars } from "../../components/common/RatingStars";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { billingPeriodLabel } from "../../types/room";
import styles from "./HostelsListPage.module.css";

export default function HostelsListPage() {
  const { user } = useAuth();
  const { data, loading, error } = useLandlordHostels(user?.id ?? "");

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="My hostels"
        subtitle="Manage the hostels you own."
        actions={
          <Link to="/landlord/hostels/create">
            <Button>+ New Hostel</Button>
          </Link>
        }
      />

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={200} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Failed to load hostels" description={error} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No hostels yet"
          description="Create your first hostel to begin."
          action={
            <Link to="/landlord/hostels/create">
              <Button size="sm">Create hostel</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          {data.map((h) => (
            <Link
              key={h.id}
              to={`/landlord/hostels/${h.id}`}
              className={styles.card}
            >
              <img
                src={h.images[0]}
                alt=""
                className={styles.image}
                loading="lazy"
              />
              <div className={styles.body}>
                <header className={styles.header}>
                  <h3 className={styles.name}>{h.name}</h3>
                  {h.landlordVerified && <Badge tone="success">Verified</Badge>}
                </header>
                <p className={styles.location}>📍 {h.location}</p>
                <div className={styles.meta}>
                  <RatingStars value={h.rating} count={h.reviewCount} />
                  <span className={styles.vacant}>{h.vacantRooms} vacant</span>
                </div>
                {h.priceRange && (
                  <PriceDisplay
                    amount={h.priceRange[0]}
                    suffix={
                      h.billingPeriod
                        ? `/${billingPeriodLabel[h.billingPeriod].replace("per ", "")}`
                        : "/period varies"
                    }
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
