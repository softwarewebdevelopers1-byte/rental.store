import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <h1 className={styles.headline}>
          Find your next hostel. Manage it all in one place.
        </h1>
        <p className={styles.subhead}>
          Discover verified hostels, pay rent, chat with landlords, raise
          maintenance requests, and shop for essentials — all from a single
          dashboard.
        </p>
        <div className={styles.ctas}>
          <Link to="/hostels">
            <Button size="lg">Find a Hostel</Button>
          </Link>
          <Link to="/register/student">
            <Button variant="secondary" size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        {[
          {
            icon: "🏠",
            title: "Discover hostels",
            body: "Filter by location, price, rating, and vacant rooms.",
          },
          {
            icon: "💬",
            title: "Talk to landlords",
            body: "Message your landlord and caretaker directly.",
          },
          {
            icon: "💳",
            title: "Pay rent",
            body: "Track payments and get reminders before due dates.",
          },
          {
            icon: "🛠️",
            title: "Raise issues",
            body: "Report maintenance issues and follow the resolution.",
          },
          {
            icon: "🛒",
            title: "Shop essentials",
            body: "Buy hostel products and packs from market agents.",
          },
          {
            icon: "⭐",
            title: "Leave reviews",
            body: "Rate the hostel you stayed in and help others choose.",
          },
        ].map((f) => (
          <div key={f.title} className={styles.feature}>
            <div className={styles.featureIcon} aria-hidden>
              {f.icon}
            </div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
