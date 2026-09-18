import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import styles from "./Topbar.module.css";

interface TopbarProps {
  onMenuClick?: () => void;
  onToggle?: () => void;
  showMenuButton?: boolean;
  title?: string;
  collapsed?: boolean;
}

export function Topbar({
  onMenuClick,
  onToggle,
  showMenuButton = false,
  title,
  collapsed = false,
}: TopbarProps) {
  const { user } = useAuth();
  const { count } = useCart();
  const { items, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {showMenuButton && (
          <button
            className={styles.menuBtn}
            onClick={() => (onToggle ? onToggle() : onMenuClick?.())}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-expanded={!collapsed}
          >
            {collapsed ? "»" : "«"}
          </button>
        )}
        {title && <h2 className={styles.title}>{title}</h2>}
      </div>
      <div className={styles.right}>
        <Link
          to="/marketplace/cart"
          className={styles.cartBtn}
          aria-label={`Cart (${count})`}
        >
          🛒
          {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
        <div className={styles.bellWrap}>
          <button
            className={styles.bell}
            aria-label={`Notifications (${unreadCount} unread)`}
            onClick={() => setOpen((v) => !v)}
          >
            🔔
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
          {open && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className={styles.markAll}
                    onClick={() => void markAllRead()}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {items.length === 0 ? (
                <div className={styles.dropdownEmpty}>
                  No notifications yet.
                </div>
              ) : (
                <ul className={styles.list}>
                  {items.slice(0, 6).map((n) => (
                    <li
                      key={n.id}
                      className={`${styles.item} ${n.read ? "" : styles.itemUnread}`}
                    >
                      <div className={styles.itemTitle}>{n.title}</div>
                      <div className={styles.itemBody}>{n.body}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {user && (
          <Link to="/" className={styles.avatar} aria-label={user.name}>
            {user.name.charAt(0).toUpperCase()}
          </Link>
        )}
      </div>
    </header>
  );
}