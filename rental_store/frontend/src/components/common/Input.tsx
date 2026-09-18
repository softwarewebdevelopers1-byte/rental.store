import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className = "", ...rest }, ref) => {
    const inputId =
      id ?? rest.name ?? `input-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className={`${styles.field} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${styles.input} ${error ? styles.hasError : ""}`}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...rest}
        />
        {error ? (
          <span id={`${inputId}-error`} className={styles.error}>
            {error}
          </span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
