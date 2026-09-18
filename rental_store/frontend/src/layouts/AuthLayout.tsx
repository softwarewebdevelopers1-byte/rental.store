import { Link, Outlet } from "react-router-dom";
import styles from "./AuthLayout.module.css";

export function AuthLayout() {
  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <Link to="/" className={styles.brand}>
          <span aria-hidden>🏠</span> HostelHub
        </Link>
        <div className={styles.card}>
          <Outlet />
        </div>
        <p className={styles.note}>Frontend prototype — mock data only.</p>
      </div>
    </div>
  );
}
