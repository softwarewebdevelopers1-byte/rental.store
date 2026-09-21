import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TermsCheckbox } from "../../components/auth/TermsCheckbox";
import { Button } from "../../components/common/Button";
import styles from "./StudentRegisterPage.module.css";

export default function LandlordRegisterPage() {
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
      <h1 className={styles.title}>Landlord registration</h1>
      <p className={styles.subtitle}>
        Landlord sign-up is by invitation only. Please use the invitation link
        your admin shared with you. If you don't have one, contact support.
      </p>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <TermsCheckbox
          ref={termsRef}
          policyKey="landlord"
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
