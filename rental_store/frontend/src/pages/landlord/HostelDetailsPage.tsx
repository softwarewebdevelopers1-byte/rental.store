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
import { RoomTable } from "../../components/hostel/RoomTable";
import { RoomFormModal } from "../../components/hostel/RoomFormModal";
import { TenantCard } from "../../components/hostel/TenantCard";
import { roomService } from "../../services/roomService";
import { useToast } from "../../hooks/useToast";
import { mockRooms } from "../../data/rooms";
import { mockUsers } from "../../data/users";
import type { Room } from "../../types/room";
import type { Caretaker, User } from "../../types/user";
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

function isCaretaker(user: User): user is Caretaker {
  return user.role === "CARETAKER";
}

export default function LandlordHostelDetailsPage() {
  const { hostelId = "" } = useParams<{ hostelId: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const [hostel, setHostel] = useState<HostelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("overview");

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
        setLoading(false);
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

  const caretakers = useMemo(
    () =>
      mockUsers
        .filter(isCaretaker)
        .filter((u) => u.assignedHostelIds.includes(hostelId)),
    [hostelId],
  );

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

  async function handleRoomSubmit(values: { number: string; price: number }) {
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
              const room = mockRooms.find((r) => r.id === t.roomId);
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
            {caretakers.map((c) => (
              <Card key={c.id} title={c.name} subtitle={c.email}>
                <Badge tone="info">CARETAKER</Badge>
              </Card>
            ))}
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

      {tab === "photos" &&
        (hostel.images.length === 0 ? (
          <EmptyState
            title="No photos"
            description="Edit the hostel to add image URLs."
          />
        ) : (
          <div className={styles.photoGrid}>
            {hostel.images.map((src) => (
              <img key={src} src={src} alt="" className={styles.photo} />
            ))}
          </div>
        ))}

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
