import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useCaretakerMaintenance } from "../../hooks/useCaretaker";
import { PageHeader } from "../../components/layout/PageHeader";
import { MaintenanceCard } from "../../components/maintenance/MaintenanceCard";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Tabs, type TabItem } from "../../components/common/Tabs";
import type { MaintenanceStatus } from "../../types/maintenance";
import styles from "./CaretakerMaintenancePage.module.css";

type FilterId = "all" | MaintenanceStatus;

export default function CaretakerMaintenancePage() {
  const { user } = useAuth();
  const { show } = useToast();
  const { data, loading, error, reload, setStatus } = useCaretakerMaintenance(
    user?.id ?? "",
  );
  const [filter, setFilter] = useState<FilterId>("all");

  const counts = useMemo(
    () => ({
      all: data.length,
      OPEN: data.filter((m) => m.status === "OPEN").length,
      IN_PROGRESS: data.filter((m) => m.status === "IN_PROGRESS").length,
      RESOLVED: data.filter((m) => m.status === "RESOLVED").length,
      CLOSED: data.filter((m) => m.status === "CLOSED").length,
    }),
    [data],
  );

  const filtered =
    filter === "all" ? data : data.filter((m) => m.status === filter);

  const tabs: TabItem[] = [
    { id: "all", label: "All", badge: counts.all },
    { id: "OPEN", label: "Open", badge: counts.OPEN },
    { id: "IN_PROGRESS", label: "In progress", badge: counts.IN_PROGRESS },
    { id: "RESOLVED", label: "Resolved", badge: counts.RESOLVED },
    { id: "CLOSED", label: "Closed", badge: counts.CLOSED },
  ];

  async function update(id: string, status: MaintenanceStatus) {
    await setStatus(id, status);
    show(`Marked ${status.toLowerCase().replace("_", " ")}.`, "success");
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Maintenance requests"
        subtitle="Update statuses for requests in your assigned hostels."
      />

      <Tabs
        items={tabs}
        activeId={filter}
        onChange={(id) => setFilter(id as FilterId)}
      />

      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description="No requests match this filter."
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((m) => (
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
