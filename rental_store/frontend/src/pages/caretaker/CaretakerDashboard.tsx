import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useCaretakerHostels,
  useCaretakerStats,
  useCaretakerMaintenance,
} from "../../hooks/useCaretaker";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { MaintenanceCard } from "../../components/maintenance/MaintenanceCard";
import styles from "./CaretakerDashboard.module.css";

export default function CaretakerDashboard() {
  const { user } = useAuth();
  const { data: hostels, loading: loadingHostels } = useCaretakerHostels(
    user?.id ?? "",
  );
  const { stats, loading: loadingStats } = useCaretakerStats(user?.id ?? "");
  const { data: maintenance, loading: loadingMaintenance } =
    useCaretakerMaintenance(user?.id ?? "");

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Welcome${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Everything you need for your assigned hostels."
      />

      {loadingStats ? (
        <div className={styles.statsGrid}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={90} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : stats ? (
        <section className={styles.statsGrid}>
          <StatCard label="Assigned hostels" value={stats.assignedHostels} />
          <StatCard label="Tenants" value={stats.totalTenants} tone="success" />
          <StatCard
            label="Open requests"
            value={stats.openRequests}
            tone={stats.openRequests > 0 ? "warning" : "default"}
          />
          <StatCard label="In progress" value={stats.inProgressRequests} />
          <StatCard
            label="Resolved"
            value={stats.resolvedRequests}
            tone="success"
          />
        </section>
      ) : null}

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>My hostels</h2>
        </div>
        {loadingHostels ? (
          <Skeleton height={120} radius="var(--radius-lg)" />
        ) : hostels.length === 0 ? (
          <EmptyState
            title="No hostels assigned"
            description="Your landlord will assign hostels to you."
          />
        ) : (
          <div className={styles.hostelGrid}>
            {hostels.map((h) => (
              <Card key={h.id} title={h.name} subtitle={h.location}>
                <Link to="/caretaker/maintenance">
                  <Button size="sm" variant="secondary">
                    View maintenance
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent maintenance</h2>
          <Link to="/caretaker/maintenance" className={styles.seeAll}>
            See all
          </Link>
        </div>
        {loadingMaintenance ? (
          <Skeleton height={120} radius="var(--radius-lg)" />
        ) : maintenance.length === 0 ? (
          <EmptyState
            title="No maintenance requests"
            description="All clear for now."
          />
        ) : (
          <div className={styles.maintenanceGrid}>
            {maintenance.slice(0, 3).map((m) => (
              <MaintenanceCard key={m.id} request={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
