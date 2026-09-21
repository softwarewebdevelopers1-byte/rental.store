import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  hostelService,
  type HostelSummary,
} from "../../services/hostelService";
import { paymentService } from "../../services/paymentService";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge } from "../../components/common/Badge";
import { RatingStars } from "../../components/common/RatingStars";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { MpesaPaymentModal } from "../../components/payments/MpesaPaymentModal";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { billingPeriodLabel, type Room } from "../../types/room";
import styles from "./HostelDetailsPage.module.css";

export default function HostelDetailsPage() {
  const { hostelId = "" } = useParams<{ hostelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show } = useToast();
  const [hostel, setHostel] = useState<HostelSummary | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [landlordPhone, setLandlordPhone] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [h, r] = await Promise.all([
        hostelService.getById(hostelId),
        hostelService.getRooms(hostelId),
      ]);
      setHostel(h);
      setRooms(r);
      setActiveImage(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load hostel");
    } finally {
      setLoading(false);
    }
  }

  async function openRoomPayment(room: Room) {
    if (!user || user.role !== "STUDENT") {
      show("Sign in as a student to request a room.", "error");
      return;
    }
    setSelectedRoom(room);
    setPaymentOpen(true);
  }

  async function handleMpesaConfirm({
    phone,
    mpesaCode,
  }: {
    phone: string;
    mpesaCode: string;
  }) {
    if (!user || user.role !== "STUDENT" || !hostel || !selectedRoom) return;

    setSubmitting(true);
    try {
      await paymentService.createPayment({
        studentId: user.id,
        hostelId: hostel.id,
        roomId: selectedRoom.id,
        amount: selectedRoom.price,
        status: "PAID",
        dueDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        method: "MPESA",
        mpesaPhone: phone,
        mpesaCode,
      });
      const bookedRoom = await hostelService.bookRoom(
        selectedRoom.id,
        hostel.id,
        user.id,
        user.name,
      );
      if (!bookedRoom) throw new Error("This room is no longer available.");

      setRooms((current) =>
        current.map((room) => (room.id === bookedRoom.id ? bookedRoom : room)),
      );
      show(`M-Pesa payment confirmed — ${mpesaCode}`, "success");
      setPaymentOpen(false);
    } catch (e) {
      show(
        e instanceof Error ? e.message : "Room request payment failed",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    void load();
  }, [hostelId]);

  useEffect(() => {
    // Fetch landlord phone for contact links
    (async () => {
      try {
        if (hostel?.landlordId) {
          const mod = await import("../../services/landlordService");
          const landlord = await mod.landlordService.getById(hostel.landlordId);
          setLandlordPhone(landlord.phone ?? null);
        } else {
          setLandlordPhone(null);
        }
      } catch {
        setLandlordPhone(null);
      }
    })();
  }, [hostel]);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <Skeleton height={280} radius="var(--radius-lg)" />
        <Skeleton height={32} width="50%" />
        <Skeleton height={20} width="30%" />
        <Skeleton height={200} radius="var(--radius-lg)" />
      </div>
    );
  }
  if (error)
    return (
      <div className={styles.wrap}>
        <ErrorState description={error} onRetry={load} />
      </div>
    );
  if (!hostel)
    return (
      <div className={styles.wrap}>
        <EmptyState
          title="Hostel not found"
          description="It may have been removed."
        />
      </div>
    );

  const vacantRooms = rooms.filter((r) => r.status === "VACANT");
  const joinHostel = () => {
    if (user?.role === "STUDENT") {
      navigate(`/student/change-hostel?code=${encodeURIComponent(hostel.code)}`);
      return;
    }
    if (!user) {
      const destination = `/student/change-hostel?code=${encodeURIComponent(hostel.code)}`;
      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
      return;
    }
    navigate("/register/student");
  };

  return (
    <div className={styles.wrap}>
      <Link to="/hostels" className={styles.back}>
        ← Back to hostels
      </Link>
      <PageHeader
        title={hostel.name}
        subtitle={hostel.location}
        actions={
          hostel.landlordVerified ? (
            <Badge tone="success">Verified landlord</Badge>
          ) : undefined
        }
      />

      <section className={styles.gallery}>
        <div className={styles.hero}>
          <img
            src={hostel.images[activeImage]}
            alt={`${hostel.name} photo ${activeImage + 1}`}
          />
        </div>
        <div className={styles.thumbs}>
          {hostel.images.map((src, i) => (
            <button
              key={src}
              className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ""}`}
              onClick={() => setActiveImage(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </section>

      <section className={styles.infoGrid}>
        <div className={styles.infoBlock}>
          <h2>About this hostel</h2>
          <p>{hostel.description || "No description provided."}</p>
        </div>
        <div className={styles.sideCard}>
          <div className={styles.ratingRow}>
            <RatingStars
              value={hostel.rating}
              count={hostel.reviewCount}
              size="md"
            />
          </div>
          <div className={styles.stat}>
            <span>Vacant rooms</span>
            <strong>{vacantRooms.length}</strong>
          </div>
          <div className={styles.stat}>
            <span>Price range</span>
            <strong>
              {hostel.priceRange ? (
                <>
                  <PriceDisplay
                    amount={hostel.priceRange[0]}
                    suffix={
                      hostel.billingPeriod
                        ? `/${billingPeriodLabel[hostel.billingPeriod].replace("per ", "")}`
                        : "/period varies"
                    }
                    size="sm"
                  />{" "}
                  –{" "}
                  <PriceDisplay
                    amount={hostel.priceRange[1]}
                    suffix={
                      hostel.billingPeriod
                        ? `/${billingPeriodLabel[hostel.billingPeriod].replace("per ", "")}`
                        : "/period varies"
                    }
                    size="sm"
                  />
                </>
              ) : (
                "—"
              )}
            </strong>
          </div>
          {landlordPhone && (
            <div className={styles.stat}>
              <span>Contact landlord</span>
              <strong>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <a href={`tel:${landlordPhone}`}>
                    <Button size="sm" variant="secondary">Call</Button>
                  </a>
                  <a href={`https://wa.me/${landlordPhone.replace(/\D/g, "").replace(/^0+/, "")}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="primary">WhatsApp</Button>
                  </a>
                </div>
              </strong>
            </div>
          )}
          <Button fullWidth size="lg" onClick={joinHostel}>
            Join this hostel
          </Button>
        </div>
      </section>

      <section className={styles.rooms}>
        <h2>Available rooms</h2>
        {rooms.length === 0 ? (
          <EmptyState
            title="No rooms listed"
            description="This hostel hasn't published any rooms yet."
          />
        ) : (
          <div className={styles.roomGrid}>
            {rooms.map((r) => {
              const bookable = r.status === "VACANT";
              return (
                <div
                  key={r.id}
                  className={`${styles.roomCard} ${bookable ? "" : styles.roomDisabled}`}
                >
                  <div className={styles.roomTop}>
                    <span className={styles.roomNumber}>Room {r.number}</span>
                    <Badge tone={bookable ? "success" : "info"}>
                      {r.status}
                    </Badge>
                  </div>
                  <PriceDisplay
                    amount={r.price}
                    suffix={`/${billingPeriodLabel[r.billingPeriod ?? "MONTHLY"].replace("per ", "")}`}
                  />
                  <Button
                    size="sm"
                    variant={bookable ? "primary" : "secondary"}
                    disabled={!bookable || submitting}
                    onClick={() => void openRoomPayment(r)}
                  >
                    {bookable ? "Request room" : "Occupied"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <MpesaPaymentModal
        open={paymentOpen}
        amount={selectedRoom?.price ?? 0}
        phone={user?.role === "STUDENT" ? user.phone : undefined}
        onClose={() => {
          if (!submitting) {
            setPaymentOpen(false);
            setSelectedRoom(null);
          }
        }}
        onConfirm={handleMpesaConfirm}
      />
    </div>
  );
}
