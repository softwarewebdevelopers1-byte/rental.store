import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useStudentMaintenance } from "../../hooks/useMaintenance";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { MaintenanceCard } from "../../components/maintenance/MaintenanceCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { FileUpload } from "../../components/common/FileUpload";
import type { MaintenanceCategory } from "../../types/maintenance";
import styles from "./StudentMaintenancePage.module.css";

const CATEGORIES: { value: MaintenanceCategory; label: string }[] = [
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "WIFI", label: "Wi-Fi" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "OTHER", label: "Other" },
];

export default function StudentMaintenancePage() {
  const { user } = useAuth();
  const { show } = useToast();
  const { data, loading, error, reload, create } = useStudentMaintenance(
    user?.id ?? "",
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory>("PLUMBING");
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      show("Please sign in to raise a request.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await create({
        studentId: user.id,
        hostelId: "",
        roomId: "",
        title,
        description,
        category,
        attachments,
      });
      setTitle("");
      setDescription("");
      setAttachments([]);
      show("Maintenance request submitted.", "success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Maintenance"
        subtitle="Report issues and track their status."
      />

      <Card title="New request">
        <form onSubmit={onSubmit} className={styles.form}>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
            options={CATEGORIES}
          />
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <FileUpload
            folder="maintenance"
            label="Attachments (optional)"
            accept="image/*,application/pdf"
            multiple
            value={attachments}
            onChange={setAttachments}
          />
          <Button
            type="submit"
            disabled={!title || !description}
            loading={submitting}
          >
            Submit request
          </Button>
        </form>
      </Card>

      <section>
        <h2 className={styles.sectionTitle}>My requests</h2>
        {loading ? (
          <Skeleton height={120} radius="var(--radius-lg)" />
        ) : error ? (
          <ErrorState description={error} onRetry={reload} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="Raise a request above if anything needs fixing."
          />
        ) : (
          <div className={styles.list}>
            {data.map((m) => (
              <MaintenanceCard key={m.id} request={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
