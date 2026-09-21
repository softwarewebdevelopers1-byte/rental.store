import { forwardRef } from "react";
import { Link } from "react-router-dom";
import type { PolicyKey } from "../../content/policies";
import { policyKeyToUrlSlug } from "../../content/policies";
import styles from "./TermsCheckbox.module.css";

export interface TermsCheckboxProps {
  policyKey: PolicyKey;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export const TermsCheckbox = forwardRef<HTMLInputElement, TermsCheckboxProps>(
  ({ policyKey, checked, onChange, error, disabled = false }, ref) => {
    const checkboxId = `terms-${policyKey}`;
    const policyUrl = `/policies/${policyKeyToUrlSlug(policyKey)}`;

    return (
      <div className={styles.wrap}>
        <div className={styles.row}>
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
            className={styles.checkbox}
          />

          <div className={styles.textWrap}>
            <label htmlFor={checkboxId} className={styles.label}>
              I agree to the Hostelix
            </label>{" "}
            <Link
              to={policyUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              Terms & Conditions
            </Link>
            <span className={styles.punctuation}>.</span>{" "}
            <Link
              to={policyUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.secondaryLink}
            >
              View policy
            </Link>
          </div>
        </div>

        {error ? (
          <span id={`${checkboxId}-error`} role="alert" className={styles.error}>
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

TermsCheckbox.displayName = "TermsCheckbox";
