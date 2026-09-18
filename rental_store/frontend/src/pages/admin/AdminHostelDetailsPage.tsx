import { Link, useParams } from "react-router-dom";
import { useAdminHostel } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { RatingStars } from "../../components/common/RatingStars";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./AdminHostelDetailsPage.module.css";

export default function AdminHostelDetailsPage() {
  const { hostelId = "" } = useParams<{ hostelId: string }>();
  const { hostel, rooms, loading } = useAdminHostel(hostelId);

  if (loading) return <Skeleton height={400} radius="var(--radius-lg)" />;
  if (!hostel) return <EmptyState title="Hostel not found" />;

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={hostel.name}
        subtitle={hostel.location}
        actions={
          <Link to="/admin/hostels">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />
      <div className={styles.grid}>
        <Card title="Overview">
          <dl className={styles.dl}>
            <div>
              <dt>Code</dt>
              <dd>
                <code>{hostel.code}</code>
              </dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>
                <RatingStars value={hostel.rating} count={hostel.reviewCount} />
              </dd>
            </div>
            <div>
              <dt>Landlord ID</dt>
              <dd>
                <code>{hostel.landlordId}</code>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={hostel.active ? "ACTIVE" : "INACTIVE"} />
              </dd>
            </div>
          </dl>
          {hostel.description && (
            <p className={styles.desc}>{hostel.description}</p>
          )}
        </Card>
        <Card title="Rooms" padding="none">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Number</th>
                <th>Price</th>
                <th>Status</th>
                <th>Tenant</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.number}</td>
                  <td>
                    <PriceDisplay amount={r.price} size="sm" />
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>{r.tenantName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
