import { Link, Outlet } from "react-router-dom";
import { APP_LOGO, APP_NAME } from "../constants/config";
import styles from "./AuthLayout.module.css";

export function AuthLayout() {
  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <Link to="/" className={styles.brand}>
          <img src={APP_LOGO} alt={APP_NAME} className={styles.logo} />
        </Link>
        <div className={styles.card}>
          <Outlet />
        </div>
        <p className={styles.note}>Frontend prototype — mock data only.</p>
      </div>
    </div>
  );
}
