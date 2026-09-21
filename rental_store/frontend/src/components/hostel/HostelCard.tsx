import { Link } from "react-router-dom";
import type { HostelSummary } from "../../services/hostelService";
import { Badge } from "../common/Badge";
import { RatingStars } from "../common/RatingStars";
import { PriceDisplay } from "../common/PriceDisplay";
import { billingPeriodLabel } from "../../types/room";
import styles from "./HostelCard.module.css";

interface HostelCardProps {
  hostel: HostelSummary;
}

export function HostelCard({ hostel }: HostelCardProps) {
  const [minPrice] = hostel.priceRange ?? [0, 0];
  return (
    <article className={styles.card}>
      <Link
        to={`/hostels/${hostel.id}`}
        className={styles.imageLink}
        aria-label={`View ${hostel.name}`}
      >
        <img
          src={hostel.images[0]}
          alt=""
          className={styles.image}
          loading="lazy"
        />
      </Link>
      <div className={styles.body}>
        <header className={styles.header}>
          <h3 className={styles.name}>{hostel.name}</h3>
          {hostel.landlordVerified && <Badge tone="success">Verified</Badge>}
        </header>
        <p className={styles.location}>📍 {hostel.location}</p>
        <div className={styles.meta}>
          <RatingStars value={hostel.rating} count={hostel.reviewCount} />
          <span className={styles.vacant}>
            {hostel.vacantRooms > 0
              ? `${hostel.vacantRooms} vacant`
              : "Fully booked"}
          </span>
        </div>
        <footer className={styles.footer}>
          <div className={styles.price}>
            {hostel.priceRange ? (
              <>
                <span className={styles.from}>from</span>{" "}
                <PriceDisplay
                  amount={minPrice}
                  suffix={
                    hostel.billingPeriod
                      ? `/${billingPeriodLabel[hostel.billingPeriod].replace("per ", "")}`
                      : "/period varies"
                  }
                />
              </>
            ) : (
              <span className={styles.from}>Price on request</span>
            )}
          </div>
          <Link to={`/hostels/${hostel.id}`} className={styles.cta}>
            View details
          </Link>
        </footer>
      </div>
    </article>
  );
}
