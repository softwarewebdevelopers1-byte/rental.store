import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { landlordNav } from "../constants/routes";
import styles from "./LandlordLayout.module.css";

export function LandlordLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={`${styles.sidebarWrap} ${open ? styles.open : ""}`}>
        <Sidebar
          items={landlordNav}
          title="HostelHub"
          onNavigate={() => setOpen(false)}
        />
      </div>
      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
      )}
      <div className={styles.main}>
        <Topbar showMenuButton onMenuClick={() => setOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
