import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { useToast } from "../../hooks/useToast";
import { ROLE_LABELS } from "../../constants/roles";
import type { User } from "../../types/user";
import styles from "./UserDetailsPage.module.css";

export default function UserDetailsPage() {
  const { userId = "" } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const loaded = await adminService.getUser(userId);
      setUser(loaded);
      if (loaded) {
        setName(loaded.name);
        setEmail(loaded.email);
      }
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <Skeleton height={300} radius="var(--radius-lg)" />;
  if (!user) return <EmptyState title="User not found" />;
  const currentUser = user;

  async function saveUser(event?: FormEvent) {
    event?.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateUser(currentUser.id, {
        name: name.trim(),
        email: email.trim(),
      });
      setUser(updated);
      setEditOpen(false);
      show("User updated successfully.", "success");
    } catch (error) {
      show(error instanceof Error ? error.message : "Unable to update user.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function setUserActive(active: boolean) {
    try {
      await adminService.setUserActive(currentUser.id, active);
      setUser({ ...currentUser, active });
      show(active ? "User activated." : "User deleted.", "success");
    } catch (error) {
      show(error instanceof Error ? error.message : "Unable to update user status.", "error");
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={user.name}
        subtitle={user.email}
        actions={
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant={user.active ? "danger" : "success"}
              onClick={() => void setUserActive(!user.active)}
            >
              {user.active ? "Delete" : "Activate"}
            </Button>
            <Link to="/admin/users">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
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

      <Modal
        open={editOpen}
        title="Edit user"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void saveUser()} loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        <form onSubmit={saveUser} className={styles.form}>
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
