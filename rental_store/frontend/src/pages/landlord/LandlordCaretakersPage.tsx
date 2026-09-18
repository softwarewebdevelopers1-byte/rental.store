import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Badge } from "../..//components/common/Badge";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { mockUsers } from "../../data/users";
import { mockHostels } from "../../data/hostels";
import type { Caretaker, User } from "../../types/user";

function isCaretaker(user: User): user is Caretaker {
  return user.role === "CARETAKER";
}

export default function LandlordCaretakersPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      const myHostelIds = new Set(
        mockHostels.filter((h) => h.landlordId === user?.id).map((h) => h.id),
      );
      const cs = mockUsers
        .filter(isCaretaker)
        .filter((u) => u.assignedHostelIds.some((id) => myHostelIds.has(id)));
      if (!cancelled) {
        setCaretakers(cs);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function hostelNamesFor(caretaker: Caretaker): string {
    return caretaker.assignedHostelIds
      .map((id) => mockHostels.find((h) => h.id === id)?.name ?? id)
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
