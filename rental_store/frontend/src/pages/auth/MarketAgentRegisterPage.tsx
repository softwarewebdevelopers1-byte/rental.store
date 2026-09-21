import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TermsCheckbox } from "../../components/auth/TermsCheckbox";
import { Button } from "../../components/common/Button";
import styles from "./StudentRegisterPage.module.css";

export default function MarketAgentRegisterPage() {
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | undefined>();
  const termsRef = useRef<HTMLInputElement | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!agreedToTerms) {
      setTermsError("You must agree to the Terms & Conditions to continue.");
      termsRef.current?.focus();
      return;
    }

    setTermsError(undefined);
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Market agent registration</h1>
      <p className={styles.subtitle}>
        Market agent onboarding is by invitation only. Use your invitation link
        to continue. Contact the platform admin if you need a new invite.
      </p>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <TermsCheckbox
          ref={termsRef}
          policyKey="marketAgent"
          checked={agreedToTerms}
          onChange={(nextValue) => {
            setAgreedToTerms(nextValue);
            if (nextValue) {
              setTermsError(undefined);
            }
          }}
          error={termsError}
        />

        <Button type="submit" fullWidth size="lg" disabled={!agreedToTerms}>
          Back to sign in
        </Button>
      </form>
    </div>
  );
}
