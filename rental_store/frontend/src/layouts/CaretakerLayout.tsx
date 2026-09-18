import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { caretakerNav } from "../constants/routes";
import styles from "./CaretakerLayout.module.css";

export function CaretakerLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={`${styles.sidebarWrap} ${open ? styles.open : ""}`}>
        <Sidebar
          items={caretakerNav}
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
