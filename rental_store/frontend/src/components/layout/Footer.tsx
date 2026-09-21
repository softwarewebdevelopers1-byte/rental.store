import { Link } from "react-router-dom";
import { APP_LOGO, APP_NAME } from "../../constants/config";
import styles from "./Footer.module.css";

export interface FooterProps {
  /** Optional: hides the "back to top" link. Default false. */
  hideBackToTop?: boolean;
}

const productLinks = [
  { label: "Find a Hostel", to: "/hostels" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Products", to: "/marketplace/products" },
  { label: "Packs", to: "/marketplace/packs" },
];

const userLinks = [
  { label: "For Students", to: "/register/student" },
  { label: "For Landlords", to: "/register/landlord" },
  { label: "For Caretakers", to: "/register/landlord" },
  { label: "For Market Agents", to: "/register/market-agent" },
];

const companyLinks = [
  { label: "About Us", to: "/" },
  {
    label: "softwarewebdevelopers1@gmail.com",
    to: "mailto:softwarewebdevelopers1@gmail.com",
  },
  { label: "Call Us: 0757475316", to: "tel:0757475316" },
  { label: "Policies", to: "/policies/platform" },
  { label: "Terms", to: "/policies/platform" },
];

const legalLinks = [
  { label: "Platform Terms", to: "/policies/platform" },
  { label: "Student Terms", to: "/policies/student" },
  { label: "Landlord Terms", to: "/policies/landlord" },
  { label: "Caretaker Terms", to: "/policies/caretaker" },
  { label: "Market Agent Terms", to: "/policies/market-agent" },
];

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div className={styles.column}>
      <h2 className={styles.heading}>{title}</h2>
      <nav className={styles.links} aria-label={title}>
        {links.map((link) =>
          link.to.startsWith("mailto:") ? (
            <a key={link.label} href={link.to}>
              {link.label}
            </a>
          ) : (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}

export function Footer({ hideBackToTop: _hideBackToTop = false }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.brandColumn}>
          <Link to="/" className={styles.brand} aria-label={APP_NAME}>
            <img src={APP_LOGO} alt={APP_NAME} className={styles.logo} />
          </Link>
          <p className={styles.tagline}>
            Find, book, and manage hostel living.
          </p>
        </div>

        <FooterLinks title="Product" links={productLinks} />
        <FooterLinks title="For Users" links={userLinks} />
        <FooterLinks title="Company" links={companyLinks} />
        <FooterLinks title="Legal" links={legalLinks} />
      </div>

      <div className={styles.bottomBar}>
        <p>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <nav className={styles.bottomLinks} aria-label="Footer">
          <Link to="/policies/platform">Platform Terms</Link>
          <Link to="/policies/platform">Privacy</Link>
          <a href="mailto:softwarewebdevelopers1@gmail.com">
            softwarewebdevelopers1@gmail.com
          </a>
          <a href="tel:0757475316">0757475316</a>
        </nav>
        <p className={styles.madeLine}>Made with care by CarlozTechnologies</p>
      </div>
    </footer>
  );
}
