import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, endAdornment, id, className = "", ...rest },
    ref,
  ) => {
    const inputId =
      id ?? rest.name ?? `input-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className={`${styles.field} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={endAdornment ? styles.inputWrap : undefined}>
          <input
            id={inputId}
            ref={ref}
            className={`${styles.input} ${endAdornment ? styles.inputWithAdornment : ""} ${error ? styles.hasError : ""}`}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...rest}
          />
          {endAdornment && (
            <div className={styles.adornment}>{endAdornment}</div>
          )}
        </div>
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
