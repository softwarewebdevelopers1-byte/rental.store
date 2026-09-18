import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Skeleton } from "../../components/common/Skeleton";
import { ErrorState } from "../../components/common/ErrorState";
import {
  HostelForm,
  type HostelFormValues,
} from "../../components/hostel/HostelForm";
import {
  hostelService,
  type HostelSummary,
} from "../../services/hostelService";

export default function HostelEditPage() {
  const { hostelId = "" } = useParams<{ hostelId: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const [hostel, setHostel] = useState<HostelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const h = await hostelService.getById(hostelId);
        if (!cancelled) setHostel(h);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hostelId]);

  async function onSubmit(values: HostelFormValues) {
    setSubmitting(true);
    try {
      await hostelService.update(hostelId, {
        name: values.name,
        code: values.code,
        location: values.location,
        description: values.description || undefined,
        images: values.images,
      });
      show("Hostel updated successfully.", "success");
      navigate(`/landlord/hostels/${hostelId}`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to update", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Skeleton height={300} radius="var(--radius-lg)" />;
  if (error || !hostel)
    return <ErrorState description={error ?? "Hostel not found"} />;

  return (
    <div>
      <PageHeader title="Edit hostel" subtitle={hostel.name} />
      <Card>
        <HostelForm
          initial={{
            name: hostel.name,
            code: hostel.code,
            location: hostel.location,
            description: hostel.description ?? "",
            images: hostel.images,
          }}
          submitting={submitting}
          submitLabel="Save changes"
          onSubmit={onSubmit}
          onCancel={() => navigate(`/landlord/hostels/${hostelId}`)}
        />
      </Card>
    </div>
  );
}
