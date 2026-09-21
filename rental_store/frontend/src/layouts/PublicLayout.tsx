import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { publicNav } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../constants/roles";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { APP_NAME } from "../constants/config";
import { Footer } from "../components/layout/Footer";
import styles from "./PublicLayout.module.css";

export function PublicLayout() {
  const { user, isAuthenticated } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function navIcon(to: string) {
    return to === "/" ? (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" /></svg>
    ) : to === "/hostels" ? (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15M4 10h16M8 7h2M14 7h2M8 14h2M14 14h2M10 20v-3h4v3" /></svg>
    ) : (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2l1.5 9h9.8l2-6.5H7.2M10 19h.01M17 19h.01M14 3v5M11.5 5.5h5" /></svg>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
        <Link to="/" className={styles.brand} aria-label={APP_NAME}>
          <span className={styles.wordmark}><span>H</span>ostelix</span>
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
              <Link to="/register/landlord" className={styles.listLink}>
                List your hostel
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
      {isMobile && (
        <nav className={styles.bottomNav}>
          <div className={styles.nav}>
            {publicNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
                end={item.to === "/"}
              >
                <span className={styles.icon}>
                  {navIcon(item.to)}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className={styles.actions}>
            {isAuthenticated && user ? (
              <Link to={ROLE_HOME[user.role]} className={styles.cta}>
                Dashboard
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
        </nav>
      )}
      {location.pathname === "/" && <Footer />}
    </div>
  );
}
