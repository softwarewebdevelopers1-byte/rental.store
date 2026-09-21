export interface ParsedPhone {
  e164: string;
  country: string;
  national: string;
  valid: boolean;
}

export const COUNTRIES: readonly {
  code: string;
  dial: string;
  name: string;
  nationalLength: number[];
  nationalPrefix: string;
}[] = [
  { code: "KE", dial: "254", name: "Kenya", nationalLength: [9], nationalPrefix: "0" },
  { code: "US", dial: "1", name: "United States", nationalLength: [10], nationalPrefix: "" },
  { code: "GB", dial: "44", name: "United Kingdom", nationalLength: [10], nationalPrefix: "" },
  { code: "IN", dial: "91", name: "India", nationalLength: [10], nationalPrefix: "" },
  { code: "NG", dial: "234", name: "Nigeria", nationalLength: [10], nationalPrefix: "" },
  { code: "ZA", dial: "27", name: "South Africa", nationalLength: [9], nationalPrefix: "0" },
];

const knownDialMap = Object.fromEntries(COUNTRIES.map((country) => [country.dial, country.code]));

function isDisallowed(raw: string): boolean {
  return /[A-Za-z]/.test(raw) || /[^\d+()\-\s]/.test(raw);
}

function normalizeDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function parseKnownCountry(digits: string): { code: string; dial: string; national: string } | null {
  for (const country of COUNTRIES) {
    if (digits.startsWith(country.dial)) {
      const national = digits.slice(country.dial.length);
      if (country.nationalLength.includes(national.length)) {
        return { code: country.code, dial: country.dial, national };
      }
      if (country.code === "KE" && digits.length === 10 && digits.startsWith("0")) {
        return { code: country.code, dial: country.dial, national: digits.replace(/^0/, "") };
      }
    }
  }
  return null;
}

export function parsePhone(raw: string, defaultCountry?: string): ParsedPhone {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { e164: "", country: "", national: "", valid: false };
  }

  if (isDisallowed(trimmed)) {
    return { e164: "", country: "", national: "", valid: false };
  }

  const hasPlus = trimmed.startsWith("+");
  const digits = normalizeDigits(trimmed);

  if (!digits) {
    return { e164: "", country: "", national: "", valid: false };
  }

  if (hasPlus) {
    const afterPlus = digits;
    const lengthOk = afterPlus.length >= 8 && afterPlus.length <= 15;
    if (!lengthOk) {
      return { e164: "", country: "", national: "", valid: false };
    }

    const countryCode = Object.keys(knownDialMap).find((dial) => afterPlus.startsWith(dial)) ?? "";
    const country = countryCode ? knownDialMap[countryCode] : "";
    const national = countryCode ? afterPlus.slice(countryCode.length) : afterPlus;
    return {
      e164: `+${afterPlus}`,
      country,
      national,
      valid: true,
    };
  }

  if (!defaultCountry) {
    return { e164: "", country: "", national: "", valid: false };
  }

  const countryMeta = COUNTRIES.find((country) => country.code === defaultCountry);
  if (!countryMeta) {
    return { e164: "", country: "", national: "", valid: false };
  }

  const digitsOnly = normalizeDigits(trimmed);
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return { e164: "", country: "", national: "", valid: false };
  }

  const known = parseKnownCountry(digitsOnly);
  if (known) {
    return {
      e164: `+${known.dial}${known.national}`,
      country: known.code,
      national: known.national,
      valid: true,
    };
  }

  const normalizedLocal = digitsOnly.startsWith(countryMeta.nationalPrefix)
    ? digitsOnly.slice(countryMeta.nationalPrefix.length)
    : digitsOnly;

  if (!countryMeta.nationalLength.includes(normalizedLocal.length)) {
    return { e164: "", country: "", national: digitsOnly, valid: false };
  }

  return {
    e164: `+${countryMeta.dial}${normalizedLocal}`,
    country: countryMeta.code,
    national: digitsOnly,
    valid: true,
  };
}

export function formatPhoneForDisplay(e164: string): string {
  const trimmed = e164.trim();
  if (!trimmed || !trimmed.startsWith("+")) {
    return trimmed;
  }

  const digits = normalizeDigits(trimmed);
  if (!digits || digits.length < 8 || digits.length > 15) {
    return trimmed;
  }

  const country = Object.keys(knownDialMap).find((dial) => digits.startsWith(dial));
  if (country) {
    const national = digits.slice(country.length);
    const formatted = country === "254"
      ? ["+254", national.slice(0, 3), national.slice(3, 6), national.slice(6)].filter(Boolean).join(" ")
      : country === "1"
        ? ["+1", national.slice(0, 3), national.slice(3, 6), national.slice(6)].filter(Boolean).join(" ")
        : country === "44"
          ? ["+44", national.slice(0, 4), national.slice(4)].filter(Boolean).join(" ")
          : ["+" + country, national].join(" ");
    return formatted;
  }

  return [trimmed.slice(0, 2), trimmed.slice(2, 5), trimmed.slice(5, 8), trimmed.slice(8)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function validatePhone(e164: string, required: boolean): string | null {
  if (!e164 || e164.trim() === "") {
    return required ? "required" : null;
  }

  if (/[A-Za-z]/.test(e164) || /[^\d+()\-\s]/.test(e164)) {
    return "invalidChars";
  }

  const digits = e164.replace(/\D/g, "");
  if (digits.length < 8) return "tooShort";
  if (digits.length > 15) return "tooLong";

  const parsed = parsePhone(e164, "KE");
  if (!parsed.valid) return "invalid";
  return null;
}
