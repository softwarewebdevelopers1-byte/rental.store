import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import {
  HostelForm,
  type HostelFormValues,
} from "../../components/hostel/HostelForm";
import { hostelService } from "../../services/hostelService";

export default function HostelCreatePage() {
  const { user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values: HostelFormValues) {
    if (!user) return;
    setSubmitting(true);
    try {
      const hostel = await hostelService.create({
        landlordId: user.id,
        name: values.name,
        code: values.code,
        location: values.location,
        description: values.description || undefined,
        images: values.images,
        active: true,
      });
      show("Hostel created successfully.", "success");
      navigate(`/landlord/hostels/${hostel.id}`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to create hostel", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Create hostel"
        subtitle="Add a new hostel to your portfolio."
      />
      <Card>
        <HostelForm
          submitting={submitting}
          submitLabel="Create hostel"
          onSubmit={onSubmit}
          onCancel={() => navigate("/landlord/hostels")}
        />
      </Card>
    </div>
  );
}
