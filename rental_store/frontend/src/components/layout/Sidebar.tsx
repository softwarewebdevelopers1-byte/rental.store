import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { NavItem } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../constants/roles";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  items: NavItem[];
  title?: string;
  onNavigate?: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function Sidebar({
  items,
  title = "HostelHub",
  onNavigate,
  collapsible = false,
  defaultCollapsed = false,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      aria-label="Primary"
    >
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden>
          🏠
        </span>
        {!collapsed && <span className={styles.brandName}>{title}</span>}
        {collapsible && (
          <button
            className={styles.toggle}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        )}
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
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.icon} aria-hidden>
              {item.label.charAt(0)}
            </span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            {!collapsed && (
              <span className={styles.userRole}>
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
          <button
            className={styles.logout}
            onClick={() => void logout()}
          >
            {collapsed ? "↙" : "Sign out"}
          </button>
        </div>
      )}
    </aside>
  );
}