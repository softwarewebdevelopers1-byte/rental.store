import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useHostelRatings } from "../../hooks/useRatings";
import { ratingService } from "../../services/ratingService";
import { studentService } from "../../services/studentService";
import { hostelService, type HostelSummary } from "../../services/hostelService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { RatingStars } from "../../components/common/RatingStars";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./StudentRatingsPage.module.css";

export default function StudentRatingsPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const [hostel, setHostel] = useState<HostelSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const profile = await studentService.getSelf();
      if (cancelled) return;
      if (profile?.hostelId) {
        const h = await hostelService.getById(profile.hostelId);
        if (!cancelled) setHostel(h);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: ratings, reload } = useHostelRatings(hostel?.id ?? "");

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !hostel) return;
    setSubmitting(true);
    try {
      await ratingService.submit({
        hostelId: hostel.id,
        studentId: user.id,
        studentName: user.name,
        stars,
        comment,
      });
      setComment("");
      show("Rating submitted.", "success");
      await reload();
    } finally {
      setSubmitting(false);
    }
  }

  if (!hostel) {
    return (
      <div className={styles.wrap}>
        <PageHeader title="Rate your hostel" />
        <EmptyState
          title="No hostel to rate"
          description="Join a hostel first to leave a rating."
        />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <PageHeader title="Rate your hostel" subtitle={hostel.name} />

      <Card title="Leave a review">
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                className={`${styles.star} ${i <= stars ? styles.starActive : ""}`}
                onClick={() => setStars(i)}
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
            <span className={styles.starValue}>{stars}.0</span>
          </div>
          <Input
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <Button type="submit" disabled={!comment.trim()} loading={submitting}>
            Submit review
          </Button>
        </form>
      </Card>

      <section>
        <h2 className={styles.sectionTitle}>Recent reviews</h2>
        {ratings.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Be the first to review this hostel."
          />
        ) : (
          <div className={styles.list}>
            {ratings.map((r) => (
              <div key={r.id} className={styles.review}>
                <div className={styles.reviewTop}>
                  <strong>{r.studentName}</strong>
                  <RatingStars value={r.stars} />
                </div>
                <p className={styles.reviewBody}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
