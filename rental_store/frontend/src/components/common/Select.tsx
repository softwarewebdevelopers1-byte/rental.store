import { forwardRef, type SelectHTMLAttributes } from "react";
import styles from "./Input.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, id, className = "", ...rest }, ref) => {
    const selectId =
      id ?? rest.name ?? `select-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className={`${styles.field} ${className}`}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`${styles.input} ${error ? styles.hasError : ""}`}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className={styles.error}>{error}</span>
        ) : hint ? (
          <span className={styles.hint}>{hint}</span>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
