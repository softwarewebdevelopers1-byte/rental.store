import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useToast } from "../../hooks/useToast";
import { isEmail } from "../../utils/validators";
import styles from "./StudentRegisterPage.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { show } = useToast();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return;
    setSent(true);
    show("If an account exists, a reset link has been sent.", "success");
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Forgot password</h1>
      <p className={styles.subtitle}>
        Enter your email and we'll send a reset link.
      </p>
      {sent ? (
        <p className={styles.subtitle}>
          Check your inbox for <strong>{email}</strong>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg" disabled={!isEmail(email)}>
            Send reset link
          </Button>
        </form>
      )}
      <p className={styles.footer}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
