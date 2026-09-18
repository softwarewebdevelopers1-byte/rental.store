import { useAuth } from "../../hooks/useAuth";
import { useLandlordTenants } from "../../hooks/useLandlord";
import { PageHeader } from "../../components/layout/PageHeader";
import { TenantCard } from "../../components/hostel/TenantCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { mockRooms } from "../../data/rooms";

export default function LandlordTenantsPage() {
  const { user } = useAuth();
  const { data, loading } = useLandlordTenants(user?.id ?? "");

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="All active students in your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
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
            const room = mockRooms.find((r) => r.id === t.roomId);
            return (
              <TenantCard key={t.id} student={t} roomNumber={room?.number} />
            );
          })}
        </div>
      )}
    </div>
  );
}
