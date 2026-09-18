import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ROLE_LABELS } from "../../constants/roles";
import type { User } from "../../types/user";
import styles from "./UserDetailsPage.module.css";

export default function UserDetailsPage() {
  const { userId = "" } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setUser(await adminService.getUser(userId));
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <Skeleton height={300} radius="var(--radius-lg)" />;
  if (!user) return <EmptyState title="User not found" />;

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={user.name}
        subtitle={user.email}
        actions={
          <Link to="/admin/users">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />
      <Card title="Account">
        <dl className={styles.dl}>
          <div>
            <dt>Role</dt>
            <dd>
              <Badge tone="info">{ROLE_LABELS[user.role]}</Badge>
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={user.active ? "ACTIVE" : "INACTIVE"} />
            </dd>
          </div>
          <div>
            <dt>Joined</dt>
            <dd>{new Date(user.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd>
              <code>{user.id}</code>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
