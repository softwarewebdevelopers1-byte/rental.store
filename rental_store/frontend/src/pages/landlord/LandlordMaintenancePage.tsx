import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { MaintenanceCard } from "../../components/maintenance/MaintenanceCard";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { maintenanceService } from "../../services/maintenanceService";
import { mockHostels } from "../../data/hostels";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
} from "../../types/maintenance";

export default function LandlordMaintenancePage() {
  const { user } = useAuth();
  const { show } = useToast();
  const [items, setItems] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const hostelIds = mockHostels
      .filter((h) => h.landlordId === user?.id)
      .map((h) => h.id);
    const all = await Promise.all(
      hostelIds.map((id) => maintenanceService.listForHostel(id)),
    );
    setItems(all.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  async function update(id: string, status: MaintenanceStatus) {
    await maintenanceService.updateStatus(id, status);
    show(`Marked ${status.toLowerCase()}.`, "success");
    await load();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <PageHeader
        title="Maintenance"
        subtitle="Requests across your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : items.length === 0 ? (
        <EmptyState title="No maintenance requests" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {items.map((m) => (
            <MaintenanceCard
              key={m.id}
              request={m}
              actions={
                <>
                  {m.status !== "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void update(m.id, "IN_PROGRESS")}
                    >
                      Start
                    </Button>
                  )}
                  {m.status !== "RESOLVED" && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => void update(m.id, "RESOLVED")}
                    >
                      Resolve
                    </Button>
                  )}
                  {m.status !== "CLOSED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void update(m.id, "CLOSED")}
                    >
                      Close
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
