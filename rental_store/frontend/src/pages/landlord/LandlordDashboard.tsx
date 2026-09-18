import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useLandlordStats,
  useLandlordHostels,
  usePendingRequests,
} from "../../hooks/useLandlord";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import styles from "./LandlordDashboard.module.css";

export default function LandlordDashboard() {
  const { user } = useAuth();
  const { stats, loading: loadingStats } = useLandlordStats(user?.id ?? "");
  const { data: hostels, loading: loadingHostels } = useLandlordHostels(
    user?.id ?? "",
  );
  const { data: requests, loading: loadingRequests } = usePendingRequests(
    user?.id ?? "",
  );

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Welcome${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Manage your hostels, tenants, and requests."
        actions={
          <Link to="/landlord/hostels/create">
            <Button>+ New Hostel</Button>
          </Link>
        }
      />

      {loadingStats ? (
        <div className={styles.statsGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={90} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : stats ? (
        <section className={styles.statsGrid}>
          <StatCard label="Total hostels" value={stats.totalHostels} />
          <StatCard label="Total rooms" value={stats.totalRooms} />
          <StatCard
            label="Vacant rooms"
            value={stats.vacantRooms}
            tone="success"
          />
          <StatCard
            label="Booked rooms"
            value={stats.bookedRooms}
            tone="warning"
          />
          <StatCard
            label="Active tenants"
            value={stats.activeTenants}
            tone="success"
          />
          <StatCard
            label="Pending requests"
            value={stats.pendingRequests}
            tone={stats.pendingRequests > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Outstanding payments"
            value={stats.outstandingPayments}
            tone={stats.outstandingPayments > 0 ? "danger" : "default"}
          />
          <StatCard label="Unread messages" value={stats.unreadMessages} />
        </section>
      ) : null}

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>My hostels</h2>
          <Link to="/landlord/hostels" className={styles.seeAll}>
            See all
          </Link>
        </div>
        {loadingHostels ? (
          <div className={styles.hostelGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={140} radius="var(--radius-lg)" />
            ))}
          </div>
        ) : hostels.length === 0 ? (
          <EmptyState
            title="No hostels yet"
            description="Create your first hostel to get started."
            action={
              <Link to="/landlord/hostels/create">
                <Button size="sm">Create hostel</Button>
              </Link>
            }
          />
        ) : (
          <div className={styles.hostelGrid}>
            {hostels.map((h) => (
              <Link
                key={h.id}
                to={`/landlord/hostels/${h.id}`}
                className={styles.hostelCard}
              >
                <div className={styles.hostelName}>{h.name}</div>
                <div className={styles.hostelMeta}>
                  <span>{h.location}</span>
                </div>
                <div className={styles.hostelStats}>
                  <span>
                    <strong>{h.vacantRooms + (h.priceRange ? 0 : 0)}</strong>{" "}
                    vacant
                  </span>
                  <span>
                    <strong>{h.reviewCount}</strong> reviews
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Pending requests</h2>
          <Link to="/landlord/requests" className={styles.seeAll}>
            See all
          </Link>
        </div>
        {loadingRequests ? (
          <Skeleton height={120} radius="var(--radius-lg)" />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="New student requests will show up here."
          />
        ) : (
          <Card padding="none">
            <ul className={styles.requestList}>
              {requests.slice(0, 5).map((r) => (
                <li key={r.student.id} className={styles.requestItem}>
                  <div>
                    <div className={styles.requestName}>{r.student.name}</div>
                    <div className={styles.requestMeta}>
                      wants to join <strong>{r.requestedHostelName}</strong>
                    </div>
                  </div>
                  <Badge tone="warning">PENDING</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
