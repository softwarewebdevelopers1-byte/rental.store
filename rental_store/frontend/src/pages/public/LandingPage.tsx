import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./LandingPage.module.css";

function CheckIcon() {
  return (
    <span className={styles.trustIcon} aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8" /></svg>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>A better way to settle in</p>
          <h1>
            Find your perfect hostel.
            <span>Book it in minutes.</span>
          </h1>
          <p className={styles.subhead}>
            Verified listings. Real photos. Transparent pricing. Move in with confidence.
          </p>
          <div className={styles.ctas}>
            <Link to="/hostels"><Button size="lg">Find a Hostel →</Button></Link>
            <Link to="/marketplace"><Button variant="secondary" size="lg">Browse Marketplace</Button></Link>
          </div>
          <div className={styles.trustStrip}>
            <span><CheckIcon />Verified landlords</span>
            <span><CheckIcon />Secure payments</span>
            <span><CheckIcon />24/7 support</span>
          </div>
        </div>
      </section>

      <section className={styles.howSection}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>A simpler move</p>
            <h2>From search to move-in.</h2>
          </div>
        </div>
        <div className={styles.steps}>
          <article className={styles.step}>
            <span className={styles.stepNumber}>01</span>
            <h3>Search</h3>
            <p>Filter by location, price, and rating.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNumber}>02</span>
            <h3>Tour</h3>
            <p>View real photos and reviews from past tenants.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNumber}>03</span>
            <h3>Move in</h3>
            <p>Book, pay, and chat with your landlord.</p>
          </article>
        </div>
      </section>

      <section className={styles.marketplaceTeaser}>
        <div>
          <p className={styles.eyebrow}>Hostel life, sorted</p>
          <h2>Everything you need for hostel life.</h2>
          <p>From move-in packs to everyday essentials, find the practical things that make your new place feel like home.</p>
        </div>
        <Link to="/marketplace"><Button>Shop now →</Button></Link>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.eyebrow}>Your next chapter starts here</p>
        <h2>Ready to find your place?</h2>
        <p>Take the first step toward a stay that fits your life and your budget.</p>
        <div className={styles.ctas}>
          <Link to="/register/student"><Button size="lg">Get started</Button></Link>
          <Link to="/register/landlord"><Button variant="secondary" size="lg">List your hostel</Button></Link>
        </div>
      </section>
    </div>
  );
}
