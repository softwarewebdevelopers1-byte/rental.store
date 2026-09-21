import { useEffect, useId, useRef, useState } from "react";
import { formatPhoneForDisplay, parsePhone, validatePhone } from "../../utils/phone";
import styles from "./PhoneInput.module.css";

export interface PhoneInputProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultCountry?: "KE" | "US" | "GB" | "IN" | "NG" | "ZA";
  className?: string;
}

export function PhoneInput({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required = false,
  disabled = false,
  placeholder = "+254 712 345 678",
  defaultCountry = "KE",
  className = "",
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [displayValue, setDisplayValue] = useState(() =>
    value ? formatPhoneForDisplay(value) : "",
  );

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(value ? formatPhoneForDisplay(value) : "");
    }
  }, [value]);

  const handleBlur = () => {
    const raw = displayValue.trim();
    if (!raw) {
      onChange("");
      if (onBlur) onBlur();
      return;
    }

    const parsed = parsePhone(raw, defaultCountry);
    if (!parsed.valid) {
      onChange("");
      setDisplayValue(raw);
      if (onBlur) onBlur();
      return;
    }

    const formatted = formatPhoneForDisplay(parsed.e164);
    setDisplayValue(formatted);
    onChange(parsed.e164);
    if (onBlur) onBlur();
  };

  const handleFocus = () => {
    if (value && value.startsWith("+")) {
      setDisplayValue(value);
    }
  };

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={inputRef}
        name={name}
        type="tel"
        inputMode="tel"
        className={`${styles.input} ${error ? styles.hasError : ""}`.trim()}
        value={displayValue}
        onChange={(event) => setDisplayValue(event.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export const phoneValidation = validatePhone;
