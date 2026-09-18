import type { Room } from "../../types/room";
import { StatusBadge } from "../common/StatusBadge";
import { PriceDisplay } from "../common/PriceDisplay";
import styles from "./RoomTable.module.css";

interface RoomTableProps {
  rooms: Room[];
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  onToggleStatus?: (room: Room) => void;
}

export function RoomTable({
  rooms,
  onEdit,
  onDelete,
  onToggleStatus,
}: RoomTableProps) {
  if (rooms.length === 0) {
    return (
      <div className={styles.empty}>
        No rooms yet. Add your first room above.
      </div>
    );
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Room</th>
            <th>Price</th>
            <th>Status</th>
            <th>Tenant</th>
            {(onEdit || onDelete || onToggleStatus) && (
              <th aria-label="Actions" />
            )}
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td className={styles.roomNumber}>{r.number}</td>
              <td>
                <PriceDisplay amount={r.price} size="sm" />
              </td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td>{r.tenantName ?? <span className={styles.muted}>—</span>}</td>
              {(onEdit || onDelete || onToggleStatus) && (
                <td className={styles.actionsCell}>
                  {onToggleStatus && (
                    <button
                      className={styles.link}
                      onClick={() => onToggleStatus(r)}
                      aria-label={`Toggle status for room ${r.number}`}
                    >
                      {r.status === "VACANT" ? "Mark booked" : "Mark vacant"}
                    </button>
                  )}
                  {onEdit && (
                    <button className={styles.link} onClick={() => onEdit(r)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className={`${styles.link} ${styles.danger}`}
                      onClick={() => onDelete(r)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
