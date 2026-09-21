import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { hostelService, type HostelSummary } from "../../services/hostelService";
import styles from "./LandlordCaretakersPage.module.css";

function invitationUrl(token: string): string {
  return new URL(
    `/register/invitation/${encodeURIComponent(token)}`,
    window.location.origin,
  ).toString();
}

export default function LandlordCaretakersPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState<HostelSummary[]>([]);
  const [details, setDetails] = useState<Record<string, HostelSummary>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const hs = await hostelService.listByLandlord(user?.id ?? "");
      const loaded = await Promise.all(
        hs.map(async (hostel) => [hostel.id, await hostelService.getById(hostel.id)] as const),
      );
      setHostels(hs);
      setDetails(
        Object.fromEntries(
          loaded.flatMap(([id, detail]) => (detail ? [[id, detail]] : [])),
        ),
      );
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to load caretakers.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  async function assign(hostelId: string) {
    const email = emails[hostelId]?.trim();
    if (!email) {
      show("Enter the caretaker's account email.", "error");
      return;
    }
    setWorking(`assign:${hostelId}`);
    try {
      await hostelService.assignCaretaker(hostelId, email);
      show("Caretaker assigned.", "success");
      setEmails((current) => ({ ...current, [hostelId]: "" }));
      await load();
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to assign caretaker.", "error");
    } finally {
      setWorking(null);
    }
  }

  async function remove(hostelId: string, caretakerId: string) {
    setWorking(`remove:${caretakerId}`);
    try {
      await hostelService.removeCaretaker(hostelId, caretakerId);
      show("Caretaker removed from this hostel.", "success");
      await load();
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to remove caretaker.", "error");
    } finally {
      setWorking(null);
    }
  }

  async function generateLink(hostelId: string) {
    setWorking(`invite:${hostelId}`);
    try {
      const invitation = await hostelService.createCaretakerInvite(hostelId);
      await navigator.clipboard.writeText(invitationUrl(invitation.token));
      show("Caretaker invitation link copied. It can be used once and expires after seven days.", "success");
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to generate caretaker link.", "error");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title="Caretakers"
        subtitle="Assign, replace, or remove caretakers for each hostel."
      />
      {loading ? (
        <Skeleton height={240} radius="var(--radius-lg)" />
      ) : hostels.length === 0 ? (
        <EmptyState
          title="No hostels"
          description="Create a hostel before assigning a caretaker."
        />
      ) : (
        <div className={styles.list}>
          {hostels.map((hostel) => {
            const caretakers = details[hostel.id]?.caretakers ?? [];
            return (
              <Card key={hostel.id} title={hostel.name} subtitle={hostel.location}>
                <div className={styles.assignedList}>
                  {caretakers.length === 0 ? (
                    <p className={styles.muted}>No caretaker assigned.</p>
                  ) : (
                    caretakers.map((caretaker) => (
                      <div key={caretaker.id} className={styles.assignedRow}>
                        <div>
                          <strong>{caretaker.name}</strong>
                          <span>{caretaker.email}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={working !== null}
                          onClick={() => void remove(hostel.id, caretaker.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.controls}>
                  <Input
                    label="Assign or replace caretaker"
                    type="email"
                    placeholder="caretaker@example.com"
                    value={emails[hostel.id] ?? ""}
                    onChange={(event) => setEmails((current) => ({ ...current, [hostel.id]: event.target.value }))}
                  />
                  <Button
                    size="sm"
                    onClick={() => void assign(hostel.id)}
                    loading={working === `assign:${hostel.id}`}
                  >
                    Assign
                  </Button>
                </div>
                <div className={styles.inviteRow}>
                  <div>
                    <strong>Need a new caretaker?</strong>
                    <p className={styles.muted}>Generate a registration link. The link is single-use.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void generateLink(hostel.id)}
                    loading={working === `invite:${hostel.id}`}
                  >
                    Generate link
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
