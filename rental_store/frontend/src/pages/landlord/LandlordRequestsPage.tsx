import { useAuth } from "../../hooks/useAuth";
import { usePendingRequests } from "../../hooks/useLandlord";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./LandlordRequestsPage.module.css";

export default function LandlordRequestsPage() {
  const { user } = useAuth();
  const { data, loading, accept, reject } = usePendingRequests(user?.id ?? "");

  return (
    <div>
      <PageHeader
        title="Pending requests"
        subtitle="Students waiting to join your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : data.length === 0 ? (
        <EmptyState
          title="No pending requests"
          description="New student requests will show up here."
        />
      ) : (
        <div className={styles.list}>
          {data.map((r) => (
            <Card key={r.student.id}>
              <div className={styles.row}>
                <div>
                  <div className={styles.name}>{r.student.name}</div>
                  <div className={styles.meta}>
                    {r.student.email} · wants{" "}
                    <strong>{r.requestedHostelName}</strong>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void reject(r.student.id)}
                  >
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => void accept(r.student.id)}>
                    Accept
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
