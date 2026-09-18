import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { RatingStars } from "../../components/common/RatingStars";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { mockHostels } from "../../data/hostels";
import { mockRatings } from "../../data/ratings";
import type { Rating } from "../../types/rating";

export default function LandlordRatingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      const hostelIds = new Set(
        mockHostels.filter((h) => h.landlordId === user?.id).map((h) => h.id),
      );
      const rs = mockRatings.filter((r) => hostelIds.has(r.hostelId));
      if (!cancelled) {
        setRatings(rs);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <PageHeader
        title="Ratings"
        subtitle="What students say about your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : ratings.length === 0 ? (
        <EmptyState
          title="No ratings yet"
          description="Ratings will show up here after students review your hostels."
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {ratings.map((r) => (
            <Card key={r.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-2)",
                }}
              >
                <strong>{r.studentName}</strong>
                <RatingStars value={r.stars} />
              </div>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                {r.comment}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
