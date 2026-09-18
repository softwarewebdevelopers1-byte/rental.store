import { Link, NavLink, Outlet } from "react-router-dom";
import { publicNav } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../constants/roles";
import styles from "./PublicLayout.module.css";

export function PublicLayout() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span aria-hidden>🏠</span> HostelHub
        </Link>
        <nav className={styles.nav}>
          {publicNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          {isAuthenticated && user ? (
            <Link to={ROLE_HOME[user.role]} className={styles.cta}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.login}>
                Sign in
              </Link>
              <Link to="/register/student" className={styles.cta}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} HostelHub. Frontend prototype.</span>
      </footer>
    </div>
  );
}
