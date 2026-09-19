import { Link, useParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAdminHostel } from "../../hooks/useAdmin";
import { adminService } from "../../services/adminService";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { RatingStars } from "../../components/common/RatingStars";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./AdminHostelDetailsPage.module.css";

export default function AdminHostelDetailsPage() {
  const { hostelId = "" } = useParams<{ hostelId: string }>();
  const { show } = useToast();
  const { hostel, rooms, loading, reload } = useAdminHostel(hostelId);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!hostel) return <EmptyState title="Hostel not found" />;
  const currentHostel = hostel;

  function openEditor() {
    setName(currentHostel.name);
    setCode(currentHostel.code);
    setLocation(currentHostel.location);
    setDescription(currentHostel.description ?? "");
    setEditOpen(true);
  }

  async function saveHostel(event?: FormEvent) {
    event?.preventDefault();
    setSaving(true);
    try {
      await adminService.updateHostel(currentHostel.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        location: location.trim(),
        description: description.trim(),
      });
      await reload();
      setEditOpen(false);
      show("Hostel updated successfully.", "success");
    } catch (error) {
      show(error instanceof Error ? error.message : "Unable to update hostel.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    try {
      if (currentHostel.active) {
        await adminService.deleteHostel(currentHostel.id);
      } else {
        await adminService.updateHostel(currentHostel.id, { active: true });
      }
      await reload();
      show(currentHostel.active ? "Hostel deleted." : "Hostel activated.", "success");
    } catch (error) {
      show(error instanceof Error ? error.message : "Unable to update hostel status.", "error");
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={hostel.name}
        subtitle={hostel.location}
        actions={
          <div className={styles.actions}>
            <Button variant="secondary" onClick={openEditor}>Edit</Button>
            <Button
              variant={hostel.active ? "danger" : "success"}
              onClick={() => void toggleActive()}
            >
              {hostel.active ? "Delete" : "Activate"}
            </Button>
            <Link to="/admin/hostels">
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        }
      />
      <div className={styles.grid}>
        <Card title="Overview">
          <dl className={styles.dl}>
            <div>
              <dt>Code</dt>
              <dd>
                <code>{hostel.code}</code>
              </dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>
                <RatingStars value={hostel.rating} count={hostel.reviewCount} />
              </dd>
            </div>
            <div>
              <dt>Landlord ID</dt>
              <dd>
                <code>{hostel.landlordId}</code>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={hostel.active ? "ACTIVE" : "INACTIVE"} />
              </dd>
            </div>
          </dl>
          {hostel.description && (
            <p className={styles.desc}>{hostel.description}</p>
          )}
        </Card>
        <Card title="Rooms" padding="none">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Number</th>
                <th>Price</th>
                <th>Status</th>
                <th>Tenant</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.number}</td>
                  <td>
                    <PriceDisplay amount={r.price} size="sm" />
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>{r.tenantName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal
        open={editOpen}
        title="Edit hostel"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void saveHostel()} loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        <form onSubmit={saveHostel} className={styles.form}>
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="Code" value={code} onChange={(event) => setCode(event.target.value)} required />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} required />
          <label className={styles.textareaLabel}>
            Description
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
