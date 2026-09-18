import { NavLink } from "react-router-dom";
import type { NavItem } from "../../constants/routes";
import { APP_LOGO, APP_NAME } from "../../constants/config";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../constants/roles";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  items: NavItem[];
  onNavigate?: () => void;
}

export function Sidebar({ items, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar} aria-label="Primary">
      <div className={styles.brand}>
        <img src={APP_LOGO} alt={APP_NAME} className={styles.logo} />
      </div>
      <nav className={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith("dashboard") || item.to === "/"}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{ROLE_LABELS[user.role]}</span>
          </div>
          <button className={styles.logout} onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
