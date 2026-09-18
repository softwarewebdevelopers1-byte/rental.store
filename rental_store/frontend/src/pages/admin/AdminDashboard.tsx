import { Link } from "react-router-dom";
import { usePlatformStats } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatGrid } from "../../components/admin/StatGrid";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const { data, loading } = usePlatformStats();

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Admin dashboard"
        subtitle="Platform-wide statistics and moderation."
        actions={
          <>
            <Link to="/admin/verifications">
              <Button variant="secondary">Verifications</Button>
            </Link>
            <Link to="/admin/conflicts">
              <Button>Conflicts</Button>
            </Link>
          </>
        }
      />

      {loading || !data ? (
        <div className={styles.skeletons}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} height={90} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : (
        <>
          <section>
            <h2 className={styles.sectionTitle}>People</h2>
            <StatGrid
              items={[
                { label: "Students", value: data.totalStudents },
                { label: "Landlords", value: data.totalLandlords },
                { label: "Caretakers", value: data.totalCaretakers },
                { label: "Market agents", value: data.totalMarketAgents },
              ]}
            />
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Property</h2>
            <StatGrid
              items={[
                { label: "Hostels", value: data.totalHostels },
                { label: "Rooms", value: data.totalRooms },
                { label: "Vacant", value: data.vacantRooms, tone: "success" },
                { label: "Booked", value: data.bookedRooms, tone: "warning" },
              ]}
            />
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Pending</h2>
            <StatGrid
              items={[
                {
                  label: "Verifications",
                  value: data.pendingVerifications,
                  tone: data.pendingVerifications > 0 ? "warning" : "default",
                },
                {
                  label: "Student requests",
                  value: data.pendingStudentRequests,
                  tone: data.pendingStudentRequests > 0 ? "warning" : "default",
                },
              ]}
            />
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Marketplace</h2>
            <StatGrid
              items={[
                { label: "Orders", value: data.marketplaceOrders },
                {
                  label: "Conflicts",
                  value: data.marketplaceConflicts,
                  tone: data.marketplaceConflicts > 0 ? "danger" : "default",
                },
              ]}
            />
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Quick access</h2>
            <div className={styles.quickGrid}>
              {[
                { to: "/admin/users", label: "Users" },
                { to: "/admin/landlords", label: "Landlords" },
                { to: "/admin/hostels", label: "Hostels" },
                { to: "/admin/verifications", label: "Verifications" },
                { to: "/admin/invitations", label: "Invitations" },
                { to: "/admin/orders", label: "Orders" },
                { to: "/admin/conflicts", label: "Conflicts" },
              ].map((q) => (
                <Link key={q.to} to={q.to} className={styles.quick}>
                  {q.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
