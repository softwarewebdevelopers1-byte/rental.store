import styles from "./LandlordContactButtons.module.css";

export interface LandlordContactButtonsProps {
  landlordName: string;
  landlordPhone: string;
  hostelName?: string;
  variant?: "inline" | "stacked";
  size?: "sm" | "md";
}


function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M20.5 3.5A11.9 11.9 0 0 0 12.03 0C5.45 0 .1 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.75 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.46-8.4Zm-8.47 18.3h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.72.97.99-3.63-.23-.37a9.87 9.87 0 1 1 8.36 4.62Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.35.2 1.86.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z"
      />
    </svg>
  );
}

export function LandlordContactButtons({
  landlordName,
  landlordPhone,
  hostelName,
  variant = "inline",
  size = "md",
}: LandlordContactButtonsProps) {
  const name = landlordName.trim() || "the landlord";
  const phone = landlordPhone.trim();
  const digits = phone.replace(/\D/g, "");
  const available = phone.startsWith("+") && digits.length >= 8;
  const message = hostelName?.trim()
    ? `Hi ${name}, I'm interested in a room at ${hostelName.trim()}.`
    : `Hi ${name}, I'm interested in one of your hostels.`;

  if (import.meta.env.DEV && phone && !available) {
    console.warn("Landlord contact phone is malformed or unavailable.");
  }

  const openWhatsApp = () => {
    if (!available) return;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const callLandlord = () => {
    if (!available) return;
    window.location.href = `tel:${phone}`;
  };

  const content = (
    <div className={`${styles.buttons} ${styles[variant]}`}>
      <button
        type="button"
        className={`${styles.button} ${styles.whatsapp} ${styles[size]}`}
        onClick={openWhatsApp}
        disabled={!available}
        aria-disabled={!available}
        aria-label={`Chat with ${name} on WhatsApp`}
        title={!available ? "Contact unavailable" : undefined}
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
        <span aria-hidden="true">↗</span>
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.call} ${styles[size]}`}
        onClick={callLandlord}
        disabled={!available}
        aria-disabled={!available}
        aria-label={`Call ${name}`}
        title={!available ? "Contact unavailable" : undefined}
      >
        <PhoneIcon />
        <span>Call</span>
      </button>
    </div>
  );

  return (
    <>
      {content}
      {variant === "inline" && <div className={styles.floating}>{content}</div>}
    </>
  );
}
