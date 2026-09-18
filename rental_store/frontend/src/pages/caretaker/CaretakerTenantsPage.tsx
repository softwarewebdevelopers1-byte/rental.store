import { useAuth } from "../../hooks/useAuth";
import { useCaretakerTenants } from "../../hooks/useCaretaker";
import { PageHeader } from "../../components/layout/PageHeader";
import { TenantCard } from "../../components/hostel/TenantCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";

export default function CaretakerTenantsPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useCaretakerTenants(user?.id ?? "");

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="Students in your assigned hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No tenants"
          description="Active students in your hostels will show up here."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {data.map(({ student, room, hostel }) => (
            <TenantCard
              key={student.id}
              student={student}
              roomNumber={
                room ? `${hostel.name} · ${room.number}` : hostel.name
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
