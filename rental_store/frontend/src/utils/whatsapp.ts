export interface WhatsAppRoomDetails {
  landlordName: string;
  landlordPhone: string;
  hostelName: string;
  hostelLocation?: string;
  roomNumber: string;
  roomPrice: number;
  billingPeriod?: string;
  studentName?: string;
}

export function openLandlordWhatsApp(details: WhatsAppRoomDetails): boolean {
  const name = details.landlordName.trim() || "the landlord";
  const digits = details.landlordPhone.replace(/\D/g, "");
  if (!details.landlordPhone.trim().startsWith("+") || digits.length < 8) {
    return false;
  }
  const greeting = details.studentName?.trim()
    ? `Hi ${name}, my name is ${details.studentName.trim()}.`
    : `Hi ${name},`;
  const location = details.hostelLocation?.trim()
    ? ` in ${details.hostelLocation.trim()}`
    : "";
  const message = `${greeting} I'm interested in Room ${details.roomNumber} at ${details.hostelName.trim()}${location}. The rent is KES ${details.roomPrice.toLocaleString("en-KE")}${details.billingPeriod ? `/${details.billingPeriod.toLowerCase()}` : ""}. Please let me know if it is available.`;
  window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  return true;
}
