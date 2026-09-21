import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  hostelService,
  type HostelSummary,
} from "../../services/hostelService";
import { RatingStars } from "../../components/common/RatingStars";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { MpesaPaymentModal } from "../../components/payments/MpesaPaymentModal";
import { LandlordContactButtons } from "../../components/hostel/LandlordContactButtons";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { billingPeriodLabel, type Room } from "../../types/room";
import { openLandlordWhatsApp } from "../../utils/whatsapp";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [requestOptionsOpen, setRequestOptionsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  function openRoomRequest(room: Room) {
    if (!user || user.role !== "STUDENT") {
      show("Sign in as a student to request a room.", "error");
      return;
    }
    setSelectedRoom(room);
    setRequestOptionsOpen(true);
  }

  function chatAboutRoom() {
    if (!hostel || !selectedRoom) return;
    const opened = openLandlordWhatsApp({
      landlordName: hostel.landlordName ?? "the landlord",
      landlordPhone: hostel.landlordPhone ?? "",
      hostelName: hostel.name,
      hostelLocation: hostel.location,
      roomNumber: selectedRoom.number,
      roomPrice: selectedRoom.price,
      billingPeriod: billingPeriodLabel[selectedRoom.billingPeriod].replace("per ", ""),
      studentName: user?.role === "STUDENT" ? user.name : undefined,
    });
    if (!opened) {
      show("This landlord has not provided a WhatsApp number.", "error");
      return;
    }
    setRequestOptionsOpen(false);
  }

  async function handleMpesaConfirm({
    mpesaCode,
  }: {
    phone: string;
    mpesaCode: string;
  }) {
    if (!user || user.role !== "STUDENT" || !hostel || !selectedRoom) return;

    setSubmitting(true);
    try {
      const bookedRoom = await hostelService.bookRoom(
        selectedRoom.id,
        hostel.id,
        "PAY_NOW",
        mpesaCode,
        selectedRoom.billingPeriod,
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
    if (!lightboxOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") setActiveImage((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight" && hostel) {
        setActiveImage((current) => Math.min(hostel.images.length - 1, current + 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hostel, lightboxOpen]);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <Skeleton height={360} radius="var(--radius-lg)" />
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

  const previousImage = () => setActiveImage((current) => Math.max(0, current - 1));
  const nextImage = () => setActiveImage((current) => Math.min(hostel.images.length - 1, current + 1));

  return (
    <div className={styles.wrap}>
      <Link to="/hostels" className={styles.back}>← Back to hostels</Link>

      <header className={styles.titleSection}>
        <div>
          <h1>{hostel.name}</h1>
          <div className={styles.titleMeta}>
            <span>{hostel.location}</span>
            <span aria-hidden="true">·</span>
            <RatingStars value={hostel.rating} count={hostel.reviewCount} />
          </div>
        </div>
        {hostel.landlordVerified && <span className={styles.verified}>Verified landlord</span>}
      </header>

      <section className={styles.gallery} aria-label={`${hostel.name} photos`}>
        <div className={styles.galleryTrack}>
          {hostel.images.map((src, index) => (
            <button
              key={src}
              className={`${styles.galleryImage} ${index === 0 ? styles.galleryPrimary : ""}`}
              onClick={() => { setActiveImage(index); setLightboxOpen(true); }}
              aria-label={`Open photo ${index + 1}`}
            >
              <img src={src} alt={`${hostel.name} photo ${index + 1}`} />
            </button>
          ))}
        </div>
        <div className={styles.thumbs}>
          {hostel.images.map((src, index) => (
            <button
              key={src}
              className={`${styles.thumb} ${index === activeImage ? styles.thumbActive : ""}`}
              onClick={() => setActiveImage(index)}
              aria-label={`Photo ${index + 1}`}
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
          <section className={styles.rooms}>
            <h2>Available rooms</h2>
            {rooms.length === 0 ? (
              <EmptyState
                title="No rooms listed"
                description="This hostel hasn't published any rooms yet."
              />
            ) : (
              <div className={styles.roomList}>
                {rooms.map((r) => {
                  const bookable = r.status === "VACANT";
                  return (
                    <div key={r.id} className={`${styles.roomRow} ${bookable ? "" : styles.roomDisabled}`}>
                      <span className={styles.roomNumber}>Room {r.number}</span>
                      <PriceDisplay
                        amount={r.price}
                        suffix={`/${billingPeriodLabel[r.billingPeriod ?? "MONTHLY"].replace("per ", "")}`}
                      />
                      <span className={`${styles.statusPill} ${bookable ? styles.statusVacant : styles.statusOccupied}`}>
                        {r.status}
                      </span>
                      <Button
                        size="sm"
                        variant={bookable ? "primary" : "secondary"}
                        disabled={!bookable || submitting}
                        onClick={() => openRoomRequest(r)}
                      >
                        {bookable ? "Request room" : "Occupied"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
        <aside className={styles.sideCard}>
          <div className={styles.bookingPrice}>
            <span>From</span>
            {hostel.priceRange ? (
              <PriceDisplay
                amount={hostel.priceRange[0]}
                suffix={hostel.billingPeriod ? `/${billingPeriodLabel[hostel.billingPeriod].replace("per ", "")}` : "/period varies"}
                size="lg"
              />
            ) : <strong>Price on request</strong>}
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
                  <PriceDisplay amount={hostel.priceRange[0]} suffix={hostel.billingPeriod ? `/${billingPeriodLabel[hostel.billingPeriod].replace("per ", "")}` : "/period varies"} size="sm" />
                  {" – "}
                  <PriceDisplay amount={hostel.priceRange[1]} suffix={hostel.billingPeriod ? `/${billingPeriodLabel[hostel.billingPeriod].replace("per ", "")}` : "/period varies"} size="sm" />
                </>
              ) : "—"}
            </strong>
          </div>
          <div className={styles.contact}>
            <span>Contact landlord</span>
            <LandlordContactButtons
              landlordName={hostel.landlordName ?? ""}
              landlordPhone={hostel.landlordPhone ?? ""}
              hostelName={hostel.name}
              size="sm"
            />
          </div>
          {hostel.landlordVerified && <p className={styles.trustLine}>✓ Verified landlord</p>}
          <Button fullWidth size="lg" onClick={joinHostel}>Join this hostel</Button>
        </aside>
      </section>

      {lightboxOpen && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Hostel photo viewer">
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close photo viewer">×</button>
          <button className={styles.lightboxPrev} onClick={previousImage} disabled={activeImage === 0} aria-label="Previous photo">‹</button>
          <img src={hostel.images[activeImage]} alt={`${hostel.name} photo ${activeImage + 1}`} />
          <button className={styles.lightboxNext} onClick={nextImage} disabled={activeImage === hostel.images.length - 1} aria-label="Next photo">›</button>
          <div className={styles.lightboxCount}>{activeImage + 1} / {hostel.images.length}</div>
        </div>
      )}

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

      <Modal
        open={requestOptionsOpen}
        title="Request this room"
        onClose={() => {
          if (!submitting) {
            setRequestOptionsOpen(false);
            setSelectedRoom(null);
          }
        }}
        size="sm"
      >
        {selectedRoom && (
          <div className={styles.requestOptions}>
            <div className={styles.requestRoomSummary}>
              <strong>Room {selectedRoom.number}</strong>
              <PriceDisplay
                amount={selectedRoom.price}
                suffix={`/${billingPeriodLabel[selectedRoom.billingPeriod].replace("per ", "")}`}
              />
            </div>
            <p className={styles.requestPrompt}>
              Choose how you want to contact the landlord about this room.
            </p>
            <Button
              fullWidth
              onClick={() => {
                setRequestOptionsOpen(false);
                setPaymentOpen(true);
              }}
            >
              Pay now
            </Button>
            <Button fullWidth variant="secondary" onClick={chatAboutRoom}>
              Chat landlord on WhatsApp
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
