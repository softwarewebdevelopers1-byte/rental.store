import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/StatusBadge";
import { hostelService, type HostelSummary } from "../../services/hostelService";
import type { Invitation } from "../../types/invitation";
import { formatDate } from "../../utils/formatDate";
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
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [hs, loadedInvitations] = await Promise.all([
        hostelService.listByLandlord(user?.id ?? ""),
        hostelService.listCaretakerInvitations(),
      ]);
      const loaded = await Promise.all(
        hs.map(async (hostel) => [hostel.id, await hostelService.getById(hostel.id)] as const),
      );
      setHostels(hs);
      setInvitations(loadedInvitations);
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
    void Promise.resolve().then(() => load());
    // load also runs after assign/remove actions; keep the initial fetch tied to the user id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setInvitations((current) => [
        {
          ...invitation,
          hostelId,
          hostelName: hostels.find((hostel) => hostel.id === hostelId)?.name,
        },
        ...current.filter((item) => item.id !== invitation.id),
      ]);
      show("Caretaker invitation link copied. It can be used once and expires after seven days.", "success");
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to generate caretaker link.", "error");
    } finally {
      setWorking(null);
    }
  }

  async function copyLink(invitation: Invitation) {
    try {
      await navigator.clipboard.writeText(invitationUrl(invitation.token));
      show("Invitation link copied.", "success");
    } catch {
      show("Unable to copy the invitation link.", "error");
    }
  }

  async function revokeLink(invitation: Invitation) {
    if (!window.confirm("Revoke this caretaker invitation link? It will no longer be usable.")) {
      return;
    }
    setWorking(`revoke:${invitation.id}`);
    try {
      await hostelService.revokeCaretakerInvite(invitation.id);
      setInvitations((current) => current.map((item) => (
        item.id === invitation.id ? { ...item, status: "REVOKED" } : item
      )));
      show("Invitation link revoked.", "success");
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to revoke invitation link.", "error");
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
            const hostelInvitations = invitations.filter((invitation) => invitation.hostelId === hostel.id);
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
                <div className={styles.linksSection}>
                  <div className={styles.linksHeader}>
                    <strong>Invitation links</strong>
                    <span className={styles.muted}>
                      {hostelInvitations.length} created
                    </span>
                  </div>
                  {hostelInvitations.length === 0 ? (
                    <p className={styles.muted}>No caretaker links created yet.</p>
                  ) : (
                    <div className={styles.linksList}>
                      {hostelInvitations.map((invitation) => {
                        const active = invitation.status === "ACTIVE";
                        return (
                          <div key={invitation.id} className={styles.linkRow}>
                            <div className={styles.linkInfo}>
                              {active ? (
                                <a
                                  className={styles.link}
                                  href={invitationUrl(invitation.token)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {invitationUrl(invitation.token)}
                                </a>
                              ) : (
                                <span className={`${styles.link} ${styles.inactiveLink}`}>
                                  {invitationUrl(invitation.token)}
                                </span>
                              )}
                              <div className={styles.linkMeta}>
                                <StatusBadge status={invitation.status} />
                                <span>Created {formatDate(invitation.createdAt)}</span>
                                <span>Expires {formatDate(invitation.expiresAt)}</span>
                              </div>
                            </div>
                            <div className={styles.linkActions}>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={working !== null}
                                onClick={() => void copyLink(invitation)}
                              >
                                Copy
                              </Button>
                              {active && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="danger"
                                  loading={working === `revoke:${invitation.id}`}
                                  onClick={() => void revokeLink(invitation)}
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
