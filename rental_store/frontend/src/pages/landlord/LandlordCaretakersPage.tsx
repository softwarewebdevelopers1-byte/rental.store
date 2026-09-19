import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Badge } from "../..//components/common/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { hostelService, type HostelSummary } from "../../services/hostelService";
import type { Caretaker } from "../../types/user";

export default function LandlordCaretakersPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState<HostelSummary[]>([]);
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hs = await hostelService.listByLandlord(user?.id ?? "");
        if (cancelled) return;
        setHostels(hs);
        const caretakersById = new Map<string, Caretaker>();
        for (const hostel of hs) {
          const detail = await hostelService.getById(hostel.id);
          if (!detail) continue;
          for (const c of detail.caretakers ?? []) {
            const existing = caretakersById.get(c.id);
            if (existing) {
              caretakersById.set(c.id, {
                ...existing,
                assignedHostelIds: Array.from(
                  new Set([...existing.assignedHostelIds, hostel.id]),
                ),
              });
            } else {
              caretakersById.set(c.id, c);
            }
          }
        }
        if (!cancelled) setCaretakers(Array.from(caretakersById.values()));
      } catch {
        if (!cancelled) setCaretakers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function hostelNamesFor(caretaker: Caretaker): string {
    return caretaker.assignedHostelIds
      .map((id) => hostels.find((h) => h.id === id)?.name ?? id)
      .join(", ");
  }

  return (
    <div>
      <PageHeader
        title="Caretakers"
        subtitle="Caretakers assigned to your hostels."
        actions={
          <button
            className=""
            onClick={() =>
              show("Caretaker invitations are managed by admins.", "info")
            }
          >
            Invite caretaker
          </button>
        }
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : caretakers.length === 0 ? (
        <EmptyState
          title="No caretakers"
          description="Ask the admin to assign a caretaker to your hostels."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {caretakers.map((c) => (
            <Card key={c.id} title={c.name} subtitle={c.email}>
              <Badge tone="info">Assigned to: {hostelNamesFor(c)}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
