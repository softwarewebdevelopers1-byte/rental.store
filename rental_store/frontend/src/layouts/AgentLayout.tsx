import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { agentNav } from "../constants/routes";
import styles from "./AgentLayout.module.css";

export function AgentLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${styles.shell} ${collapsed ? styles.collapsed : ""}`}
    >
      <div
        className={`${styles.sidebarWrap} ${open ? styles.open : ""} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        <Sidebar
          items={agentNav}
          title="HostelHub"
          onNavigate={() => setOpen(false)}
          collapsible
          defaultCollapsed={collapsed}
        />
      </div>
      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
      )}
      <div className={styles.main}>
        <Topbar
          showMenuButton
          onMenuClick={() => setOpen(true)}
          onToggle={() => setCollapsed((v) => !v)}
          collapsed={collapsed}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}