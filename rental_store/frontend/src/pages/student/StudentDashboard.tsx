import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStudentPayments } from "../../hooks/usePayments";
import { useStudentMaintenance } from "../../hooks/useMaintenance";
import { studentService } from "../../services/studentService";
import { hostelService, type HostelSummary } from "../../services/hostelService";
import type { Room } from "../../types/room";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { PaymentCard } from "../../components/payments/PaymentCard";
import { MaintenanceCard } from "../../components/maintenance/MaintenanceCard";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import styles from "./StudentDashboard.module.css";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { summary, loading: loadingPayments } = useStudentPayments(
    user?.id ?? "",
  );
  const { data: maintenance, loading: loadingMaintenance } =
    useStudentMaintenance(user?.id ?? "");
  const [hostel, setHostel] = useState<HostelSummary | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const profile = await studentService.getSelf();
      if (cancelled || !profile?.hostelId) return;
      const h = await hostelService.getById(profile.hostelId);
      if (cancelled) return;
      setHostel(h);
      if (profile.roomId) {
        const rooms = await hostelService.getRooms(profile.hostelId);
        const r = rooms.find((rm) => rm.id === profile.roomId) ?? null;
        if (!cancelled) setRoom(r);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const quickActions = [
    { label: "Find Hostel", to: "/hostels" },
    { label: "Pay Rent", to: "/student/payments" },
    { label: "Messages", to: "/student/messages" },
    { label: "Maintenance", to: "/student/maintenance" },
    { label: "Marketplace", to: "/marketplace" },
    { label: "Change Hostel", to: "/student/change-hostel" },
    { label: "Rate Hostel", to: "/student/ratings" },
  ];

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={`Welcome${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Here's what's happening with your stay."
      />

      <section className={styles.topGrid}>
        <Card title="Current hostel">
          {hostel ? (
            <div className={styles.hostelInfo}>
              <img
                src={hostel.images[0]}
                alt=""
                className={styles.hostelImage}
              />
              <div>
                <div className={styles.hostelName}>{hostel.name}</div>
                <div className={styles.hostelLocation}>{hostel.location}</div>
                {room && <div className={styles.room}>Room {room.number}</div>}
              </div>
            </div>
          ) : (
            <EmptyState
              title="You're not in a hostel yet"
              description="Find a hostel and request a room."
              action={
                <Link to="/hostels">
                  <Button size="sm">Find a hostel</Button>
                </Link>
              }
            />
          )}
        </Card>

        <Card title="Payment status">
          {loadingPayments ? (
            <div className={styles.skeletonStack}>
              <Skeleton height={40} />
              <Skeleton height={20} width="40%" />
            </div>
          ) : summary ? (
            <div className={styles.paymentGrid}>
              <PaymentCard label="Current rent" amount={summary.currentRent} />
              <PaymentCard
                label="Next payment"
                amount={
                  summary.history.find((p) => p.status !== "PAID")?.amount
                }
                status={summary.status}
                dueDate={summary.nextDueDate}
              />
            </div>
          ) : null}
        </Card>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Quick actions</h2>
        <div className={styles.quickGrid}>
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className={styles.quickAction}>
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Recent maintenance</h2>
        {loadingMaintenance ? (
          <Skeleton height={100} radius="var(--radius-lg)" />
        ) : maintenance.length === 0 ? (
          <EmptyState
            title="No maintenance requests"
            description="Everything looks good."
            action={
              <Link to="/student/maintenance">
                <Button size="sm" variant="secondary">
                  Raise a request
                </Button>
              </Link>
            }
          />
        ) : (
          <div className={styles.maintenanceList}>
            {maintenance.slice(0, 3).map((m) => (
              <MaintenanceCard key={m.id} request={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
