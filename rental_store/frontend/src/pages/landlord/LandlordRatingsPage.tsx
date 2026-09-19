import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { RatingStars } from "../../components/common/RatingStars";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { hostelService } from "../../services/hostelService";
import { ratingService } from "../../services/ratingService";
import type { Rating } from "../../types/rating";

export default function LandlordRatingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadRatings() {
    setLoading(true);
    setError(null);
    try {
      const hostels = await hostelService.listByLandlord(user?.id ?? "");
      const results = await Promise.all(
        hostels.map((hostel) => ratingService.listForHostel(hostel.id)),
      );
      const rs = results.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setRatings(rs);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load hostel ratings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRatings();
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
      ) : error ? (
        <ErrorState description={error} onRetry={() => void loadRatings()} />
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
