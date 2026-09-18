import { useState } from "react";
import { useVerifications } from "../../hooks/useAdmin";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import type { Landlord } from "../../types/user";
import styles from "./VerificationsPage.module.css";

export default function VerificationsPage() {
  const { show } = useToast();
  const { data, loading, decide } = useVerifications();
  const [pendingReject, setPendingReject] = useState<Landlord | null>(null);

  async function approve(l: Landlord) {
    await decide(l.id, "APPROVED");
    show(`${l.name} verified.`, "success");
  }

  async function confirmReject() {
    if (!pendingReject) return;
    await decide(pendingReject.id, "REJECTED");
    show(`${pendingReject.name}'s request rejected.`, "info");
    setPendingReject(null);
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Verifications"
        subtitle="Review landlord verification requests."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : data.length === 0 ? (
        <EmptyState
          title="No pending verifications"
          description="New verification requests will show up here."
        />
      ) : (
        <div className={styles.list}>
          {data.map((l) => (
            <Card key={l.id}>
              <div className={styles.row}>
                <div>
                  <div className={styles.name}>{l.name}</div>
                  <div className={styles.email}>{l.email}</div>
                  <div className={styles.hostels}>
                    {l.hostelIds.length} hostels
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    onClick={() => setPendingReject(l)}
                  >
                    Reject
                  </Button>
                  <Button variant="success" onClick={() => void approve(l)}>
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingReject}
        title="Reject verification?"
        message={`${pendingReject?.name}'s verification request will be rejected. They can request again later.`}
        confirmLabel="Reject"
        tone="danger"
        onCancel={() => setPendingReject(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}
