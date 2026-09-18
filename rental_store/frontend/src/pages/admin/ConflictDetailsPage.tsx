import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminConflict } from "../../hooks/useAdmin";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./ConflictDetailsPage.module.css";

export default function ConflictDetailsPage() {
  const { conflictId = "" } = useParams<{ conflictId: string }>();
  const { show } = useToast();
  const { data, loading, resolve } = useAdminConflict(conflictId);
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!data) return <EmptyState title="Conflict not found" />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resolve(resolution);
      show("Conflict resolved.", "success");
    } finally {
      setSubmitting(false);
    }
  }

  const resolved = data.status === "RESOLVED" || data.status === "REJECTED";

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Conflict #${data.id.slice(-6).toUpperCase()}`}
        subtitle={`Order #${data.orderId.slice(-6).toUpperCase()}`}
        actions={
          <Link to="/admin/conflicts">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      <div className={styles.grid}>
        <Card title="Issue">
          <div className={styles.field}>
            <span>Type</span>
            <strong>{data.issue.replace(/_/g, " ")}</strong>
          </div>
          <div className={styles.field}>
            <span>Status</span>
            <StatusBadge status={data.status} />
          </div>
          <p className={styles.description}>{data.description}</p>
        </Card>
        <Card title="Parties">
          <div className={styles.field}>
            <span>Student</span>
            <code>{data.studentId}</code>
          </div>
          <div className={styles.field}>
            <span>Agent</span>
            <code>{data.agentId}</code>
          </div>
          <div className={styles.field}>
            <span>Order</span>
            <code>{data.orderId}</code>
          </div>
        </Card>
      </div>

      {resolved ? (
        <Card title="Resolution">
          <p className={styles.resolution}>
            {data.resolution ?? "No resolution recorded."}
          </p>
        </Card>
      ) : (
        <Card title="Resolve">
          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label}>Resolution notes</label>
            <textarea
              className={styles.textarea}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              placeholder="Describe how this was resolved..."
              required
            />
            <Button
              type="submit"
              disabled={!resolution.trim()}
              loading={submitting}
            >
              Mark as resolved
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
