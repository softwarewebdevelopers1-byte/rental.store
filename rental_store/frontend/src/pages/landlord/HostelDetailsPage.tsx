import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  hostelService,
  type HostelSummary,
} from "../../services/hostelService";
import { useHostelRooms, useLandlordTenants } from "../../hooks/useLandlord";
import { useHostelRatings } from "../../hooks/useRatings";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs, type TabItem } from "../../components/common/Tabs";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { RatingStars } from "../../components/common/RatingStars";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { FileUpload } from "../../components/common/FileUpload";
import { RoomTable } from "../../components/hostel/RoomTable";
import { RoomFormModal } from "../../components/hostel/RoomFormModal";
import { TenantCard } from "../../components/hostel/TenantCard";
import { roomService } from "../../services/roomService";
import { paymentService } from "../../services/paymentService";
import { useToast } from "../../hooks/useToast";
import type { Room } from "../../types/room";
import styles from "./HostelDetailsPage.module.css";

type TabId =
  | "overview"
  | "rooms"
  | "tenants"
  | "payments"
  | "messages"
  | "caretakers"
  | "ratings"
  | "photos";

export default function LandlordHostelDetailsPage() {
  const { hostelId = "" } = useParams<{ hostelId: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const [hostel, setHostel] = useState<HostelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("overview");
  const [photoDraft, setPhotoDraft] = useState<string[]>([]);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [paymentRecorders, setPaymentRecorders] = useState<{
    permitted: Array<{ caretakerId: string; name: string; email: string }>;
    notPermitted: Array<{ caretakerId: string; name: string; email: string }>;
  }>({ permitted: [], notPermitted: [] });

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [roomSubmitting, setRoomSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const h = await hostelService.getById(hostelId);
      if (!cancelled) {
        setHostel(h);
        setPhotoDraft(h?.images ?? []);
        setLoading(false);
      }
      if (h) {
        try {
          const recorders = await paymentService.listHostelPaymentRecorders(hostelId);
          if (!cancelled) setPaymentRecorders(recorders);
        } catch {
          if (!cancelled) setPaymentRecorders({ permitted: [], notPermitted: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hostelId]);

  const {
    data: rooms,
    loading: loadingRooms,
    reload: reloadRooms,
  } = useHostelRooms(hostelId);
  const { data: tenants, loading: loadingTenants } = useLandlordTenants(
    hostel?.landlordId ?? "",
    hostelId,
  );
  const { data: ratings } = useHostelRatings(hostelId);

  const caretakers = useMemo(() => hostel?.caretakers ?? [], [hostel]);

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!hostel) return <EmptyState title="Hostel not found" />;

  const tabs: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "rooms", label: "Rooms", badge: rooms.length },
    { id: "tenants", label: "Tenants", badge: tenants.length },
    { id: "payments", label: "Payments" },
    { id: "messages", label: "Messages" },
    { id: "caretakers", label: "Caretakers", badge: caretakers.length },
    { id: "ratings", label: "Ratings", badge: ratings.length },
    { id: "photos", label: "Photos" },
  ];

  async function handleRoomSubmit(values: {
    number: string;
    price: number;
    billingPeriod: import("../../types/room").BillingPeriod;
  }) {
    setRoomSubmitting(true);
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, values);
        show("Room updated.", "success");
      } else {
        await roomService.create({ hostelId, ...values });
        show("Room added.", "success");
      }
      setRoomModalOpen(false);
      setEditingRoom(null);
      await reloadRooms();
    } finally {
      setRoomSubmitting(false);
    }
  }

  async function handleRoomDelete() {
    if (!deleteRoom) return;
    await roomService.remove(deleteRoom.id);
    show("Room deleted.", "success");
    setDeleteRoom(null);
    await reloadRooms();
  }

  async function handleToggleStatus(room: Room) {
    const next = room.status === "VACANT" ? "BOOKED" : "VACANT";
    await roomService.setStatus(room.id, next);
    await reloadRooms();
  }

  async function handleSavePhotos() {
    if (!hostel) return;
    setSavingPhotos(true);
    try {
      await hostelService.update(hostelId, { images: photoDraft });
      setHostel({ ...hostel, images: photoDraft });
      show("Photos updated.", "success");
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to update photos", "error");
    } finally {
      setSavingPhotos(false);
    }

  }

  async function handlePaymentRecorderToggle(caretakerId: string, allowed: boolean) {
    const previous = paymentRecorders;
    const permitted = [...previous.permitted];
    const notPermitted = [...previous.notPermitted];
    const source = allowed ? notPermitted : permitted;
    const selected = source.find((item) => item.caretakerId === caretakerId);
    if (!selected) return;
    const next = allowed
      ? { permitted: [...permitted, selected], notPermitted: notPermitted.filter((item) => item.caretakerId !== caretakerId) }
      : { permitted: permitted.filter((item) => item.caretakerId !== caretakerId), notPermitted: [...notPermitted, selected] };
    setPaymentRecorders(next);
    try {
      setPaymentRecorders(await paymentService.setHostelPaymentRecorder(hostelId, caretakerId, allowed));
      show(allowed ? "Caretaker can now record payments." : "Payment recording permission revoked.", "success");
    } catch (error) {
      setPaymentRecorders(previous);
      show(error instanceof Error ? error.message : "Failed to update permission", "error");
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={hostel.name}
        subtitle={hostel.location}
        actions={
          <>
            <Link to={`/landlord/hostels/${hostelId}/edit`}>
              <Button variant="secondary">Edit hostel</Button>
            </Link>
            <Button
              variant="danger"
              onClick={async () => {
                await hostelService.remove(hostelId);
                show("Hostel deactivated.", "success");
                navigate("/landlord/hostels");
              }}
            >
              Deactivate
            </Button>
          </>
        }
      />

      <Tabs
        items={tabs}
        activeId={tab}
        onChange={(id) => setTab(id as TabId)}
      />

      {tab === "overview" && (
        <div className={styles.grid}>
          <Card title="About">
            <p className={styles.description}>
              {hostel.description || "No description provided."}
            </p>
          </Card>
          <Card title="Summary">
            <div className={styles.summary}>
              <div>
                <span>Rooms</span>
                <strong>{rooms.length}</strong>
              </div>
              <div>
                <span>Vacant</span>
                <strong>
                  {rooms.filter((r) => r.status === "VACANT").length}
                </strong>
              </div>
              <div>
                <span>Booked</span>
                <strong>
                  {rooms.filter((r) => r.status === "BOOKED").length}
                </strong>
              </div>
              <div>
                <span>Rating</span>
                <RatingStars value={hostel.rating} count={hostel.reviewCount} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "rooms" && (
        <Card title="Rooms" footer={null} padding="none">
          <div className={styles.toolbar}>
            <Button
              size="sm"
              onClick={() => {
                setEditingRoom(null);
                setRoomModalOpen(true);
              }}
            >
              + Add room
            </Button>
          </div>
          {loadingRooms ? (
            <Skeleton height={200} />
          ) : (
            <RoomTable
              rooms={rooms}
              onEdit={(r) => {
                setEditingRoom(r);
                setRoomModalOpen(true);
              }}
              onDelete={(r) => setDeleteRoom(r)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </Card>
      )}

      {tab === "tenants" &&
        (loadingTenants ? (
          <Skeleton height={200} />
        ) : tenants.length === 0 ? (
          <EmptyState
            title="No tenants yet"
            description="Active students will show up here."
          />
        ) : (
          <div className={styles.tenantGrid}>
            {tenants.map((t) => {
              const room = rooms.find((r) => r.id === t.roomId);
              return (
                <TenantCard key={t.id} student={t} roomNumber={room?.number} />
              );
            })}
          </div>
        ))}

      {tab === "payments" && (
        <Card title="Payments">
          <p className={styles.description}>
            See the full payments view on the{" "}
            <Link to="/landlord/payments">Payments page</Link>.
          </p>
        </Card>
      )}

      {tab === "messages" && (
        <Card title="Messages">
          <p className={styles.description}>
            Open the <Link to="/landlord/messages">Messages page</Link> to chat
            with tenants.
          </p>
        </Card>
      )}

      {tab === "caretakers" &&
        (caretakers.length === 0 ? (
          <EmptyState
            title="No caretakers assigned"
            description="Assign caretakers from the Caretakers page."
            action={
              <Link to="/landlord/caretakers">
                <Button size="sm">Manage caretakers</Button>
              </Link>
            }
          />
        ) : (
          <div className={styles.tenantGrid}>
            {caretakers.map((c) => {
              const allowed = paymentRecorders.permitted.some((item) => item.caretakerId === c.id);
              return <Card key={c.id} title={c.name} subtitle={c.email}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge tone="info">CARETAKER</Badge>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span>Can record payments</span>
                    <input type="checkbox" checked={allowed} onChange={(event) => void handlePaymentRecorderToggle(c.id, event.target.checked)} />
                  </label>
                </div>
              </Card>;
            })}
          </div>
        ))}

      {tab === "ratings" &&
        (ratings.length === 0 ? (
          <EmptyState
            title="No ratings yet"
            description="Students can rate after staying."
          />
        ) : (
          <div className={styles.ratingList}>
            {ratings.map((r) => (
              <Card key={r.id}>
                <div className={styles.ratingTop}>
                  <strong>{r.studentName}</strong>
                  <RatingStars value={r.stars} />
                </div>
                <p className={styles.description}>{r.comment}</p>
              </Card>
            ))}
          </div>
        ))}

      {tab === "photos" && (
        <Card title="Photos" subtitle="Add new photos or remove existing ones.">
          <div className={styles.photoEditor}>
            <FileUpload
              folder="hostels"
              multiple
              label="Hostel images"
              value={photoDraft}
              onChange={setPhotoDraft}
            />
            <div className={styles.photoActions}>
              <Button
                onClick={() => void handleSavePhotos()}
                disabled={
                  savingPhotos ||
                  JSON.stringify(photoDraft) === JSON.stringify(hostel.images)
                }
                loading={savingPhotos}
              >
                Save photos
              </Button>
            </div>
          </div>
        </Card>
      )}

      <RoomFormModal
        open={roomModalOpen}
        mode={editingRoom ? "edit" : "create"}
        initial={editingRoom}
        onCancel={() => {
          setRoomModalOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={handleRoomSubmit}
        submitting={roomSubmitting}
      />

      <ConfirmDialog
        open={!!deleteRoom}
        title="Delete room?"
        message={`This will remove room ${deleteRoom?.number} from ${hostel.name}.`}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setDeleteRoom(null)}
        onConfirm={handleRoomDelete}
      />
    </div>
  );
}
