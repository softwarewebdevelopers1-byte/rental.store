import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLandlordTenants } from "../../hooks/useLandlord";
import { PageHeader } from "../../components/layout/PageHeader";
import { TenantCard } from "../../components/hostel/TenantCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { hostelService } from "../../services/hostelService";
import { useToast } from "../../hooks/useToast";

export default function LandlordTenantsPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useLandlordTenants(user?.id ?? "");
  const { show } = useToast();
  const [selected, setSelected] = useState<typeof data[number] | null>(null);
  const [removing, setRemoving] = useState(false);

  async function removeSelected() {
    if (!selected?.hostelId) return;
    setRemoving(true);
    try {
      await hostelService.removeTenant(selected.hostelId, selected.id);
      show(`${selected.name} was removed from the hostel.`, "success");
      setSelected(null);
      await reload();
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to remove the student.", "error");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="All active students in your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No tenants yet"
          description="Active students will appear here."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {data.map((t) => {
            return <TenantCard key={t.id} student={t} onRemove={() => setSelected(t)} />;
          })}
        </div>
      )}
      <ConfirmDialog
        open={!!selected}
        title="Remove student?"
        message={selected ? `${selected.name} will be removed from the hostel and their room will become vacant.` : ""}
        confirmLabel="Remove student"
        tone="danger"
        loading={removing}
        onCancel={() => setSelected(null)}
        onConfirm={() => void removeSelected()}
      />
    </div>
  );
}
