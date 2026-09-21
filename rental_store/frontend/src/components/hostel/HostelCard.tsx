import { Link } from "react-router-dom";
import type { HostelSummary } from "../../services/hostelService";
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
        {hostel.landlordVerified && (
          <span className={styles.verified}>Verified</span>
        )}
        <span className={styles.save} aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M20.8 8.8c0 5.1-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z" />
          </svg>
        </span>
      </Link>
      <div className={styles.body}>
        <h3 className={styles.name}>{hostel.name}</h3>
        <p className={styles.location}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s7-6.1 7-12A7 7 0 0 0 5 9c0 5.9 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.2" />
          </svg>
          {hostel.location}
        </p>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <span className={styles.stars} aria-hidden="true">★★★★★</span>
            <strong>{hostel.rating.toFixed(1)}</strong>
            <span>({hostel.reviewCount})</span>
          </span>
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
