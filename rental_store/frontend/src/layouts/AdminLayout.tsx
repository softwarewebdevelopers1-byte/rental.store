import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { adminNav } from "../constants/routes";
import styles from "./AdminLayout.module.css";

export function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={`${styles.sidebarWrap} ${open ? styles.open : ""}`}>
        <Sidebar
          items={adminNav}
          title="HostelHub Admin"
          onNavigate={() => setOpen(false)}
        />
      </div>
      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
      )}
      <div className={styles.main}>
        <Topbar
          showMenuButton
          onMenuClick={() => setOpen(true)}
          title="Admin"
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
