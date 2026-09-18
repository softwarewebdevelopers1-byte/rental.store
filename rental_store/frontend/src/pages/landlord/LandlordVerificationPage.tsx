import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { hostelService } from "../../services/hostelService";
import { mockLandlords } from "../../data/users";

export default function LandlordVerificationPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const landlord = mockLandlords.find((l) => l.id === user?.id);
  const [status, setStatus] = useState(
    landlord?.verificationStatus ?? "NOT_REQUESTED",
  );
  const [submitting, setSubmitting] = useState(false);

  async function requestVerification() {
    if (!user) return;
    setSubmitting(true);
    try {
      await hostelService.updateVerification(user.id, "PENDING");
      setStatus("PENDING");
      show("Verification requested.", "success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader
        title="Verification"
        subtitle="Get verified to display a badge on your hostels."
      />
      <Card>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                marginBottom: "var(--space-1)",
              }}
            >
              Current status
            </div>
            <StatusBadge status={status} />
          </div>

          {status === "NOT_REQUESTED" && (
            <div>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Request verification to show students that your hostels are
                trusted. An admin will review your request.
              </p>
              <Button onClick={requestVerification} loading={submitting}>
                Request verification
              </Button>
            </div>
          )}

          {status === "PENDING" && (
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              Your verification request is pending admin review.
            </p>
          )}

          {status === "APPROVED" && (
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-success)",
              }}
            >
              ✓ You're verified. A badge will appear on your hostels in
              discovery.
            </p>
          )}

          {status === "REJECTED" && (
            <div>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-danger)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Your verification request was rejected.
              </p>
              <Button variant="secondary" onClick={requestVerification}>
                Request again
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
