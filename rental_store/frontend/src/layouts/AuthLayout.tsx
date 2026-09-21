import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { APP_LOGO, APP_NAME } from "../constants/config";
import styles from "./AuthLayout.module.css";

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    if (location.key === "default") {
      navigate("/");
    } else {
      navigate(-1);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <Link to="/" className={styles.brand} aria-label="Hostelix">
          <img src={APP_LOGO} alt={APP_NAME} className={styles.logo} />
        </Link>
        <button type="button" className={styles.backLink} onClick={goBack}>
          ← Back
        </button>
        <div className={styles.card}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
