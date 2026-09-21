import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePendingRequests } from "../../hooks/useLandlord";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Modal } from "../../components/common/Modal";
import { hostelService, type PendingStudentRequest } from "../../services/hostelService";
import type { Room } from "../../types/room";
import { useToast } from "../../hooks/useToast";
import styles from "./LandlordRequestsPage.module.css";

export default function LandlordRequestsPage() {
  const { user } = useAuth();
  const { data, loading, error, reload, accept, reject } = usePendingRequests(
    user?.id ?? "",
  );
  const { show } = useToast();
  const [selected, setSelected] = useState<PendingStudentRequest | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [accepting, setAccepting] = useState(false);

  async function openAccept(request: PendingStudentRequest) {
    if (!request.student.requestedHostelId) return;
    setSelected(request);
    setRoomId("");
    setLoadingRooms(true);
    try {
      const available = (await hostelService.getRooms(request.student.requestedHostelId))
        .filter((room) => room.status === "VACANT");
      setRooms(available);
      if (available.length === 0) show("There are no vacant rooms in this hostel.", "error");
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to load vacant rooms.", "error");
      setSelected(null);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function confirmAccept() {
    if (!selected || !roomId) return;
    setAccepting(true);
    try {
      await accept(selected.student.id, roomId);
      show(`${selected.student.name} was assigned Room ${rooms.find((room) => room.id === roomId)?.number ?? ""}.`, "success");
      setSelected(null);
    } catch (reason) {
      show(reason instanceof Error ? reason.message : "Unable to accept this request.", "error");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pending requests"
        subtitle="Students waiting to join your hostels."
      />
      {loading ? (
        <Skeleton height={200} radius="var(--radius-lg)" />
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No pending requests"
          description="New student requests will show up here."
        />
      ) : (
        <div className={styles.list}>
          {data.map((r) => (
            <Card key={r.student.id}>
              <div className={styles.row}>
                <div>
                  <div className={styles.name}>{r.student.name}</div>
                  <div className={styles.meta}>
                    {r.student.email} · wants{" "}
                    <strong>{r.requestedHostelName}</strong>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void reject(r.student.id)}
                  >
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => void openAccept(r)}>
                    Accept
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={!!selected}
        title="Assign a room"
        onClose={() => {
          if (!accepting) setSelected(null);
        }}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)} disabled={accepting}>
              Cancel
            </Button>
            <Button onClick={() => void confirmAccept()} disabled={!roomId || loadingRooms} loading={accepting}>
              Accept and assign
            </Button>
          </>
        }
      >
        {selected && (
          <div className={styles.assignForm}>
            <p className={styles.assignIntro}>
              Choose the exact room for <strong>{selected.student.name}</strong>. The system will not choose a room automatically.
            </p>
            {loadingRooms ? (
              <Skeleton height={44} />
            ) : rooms.length === 0 ? (
              <p className={styles.noRooms}>No vacant rooms are available. Add or free a room before accepting.</p>
            ) : (
              <label className={styles.roomField}>
                <span>Room</span>
                <select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
                  <option value="">Select a vacant room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} · KES {room.price.toLocaleString("en-KE")}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
