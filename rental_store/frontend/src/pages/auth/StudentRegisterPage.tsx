import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { authService } from "../../services/authService";
import {
  isEmail,
  isNonEmpty,
  isStrongEnough,
  normalizeCode,
} from "../../utils/validators";
import styles from "./StudentRegisterPage.module.css";

type CodeState = "idle" | "checking" | "valid" | "invalid";

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostelCode, setHostelCode] = useState("");
  const [codeState, setCodeState] = useState<CodeState>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate hostel code (debounced inside effect).
  useEffect(() => {
    const trimmed = hostelCode.trim();
    if (!trimmed) return;
    const handle = window.setTimeout(async () => {
      const ok = await authService.validateHostelCode(normalizeCode(trimmed));
      setCodeState(ok ? "valid" : "invalid");
    }, 350);
    return () => window.clearTimeout(handle);
  }, [hostelCode]);

  const formValid =
    isNonEmpty(name) &&
    isEmail(email) &&
    isStrongEnough(password) &&
    (hostelCode.trim() === "" || codeState === "valid");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await registerStudent({
        name: name.trim(),
        email: email.trim(),
        password,
        hostelCode: hostelCode.trim()
          ? normalizeCode(hostelCode)
          : undefined,
      });
      const hasHostelCode = hostelCode.trim() !== "";
      show(
        hasHostelCode
          ? "Account created. Awaiting landlord approval."
          : "Account created. You can link a hostel whenever you're ready.",
        "success",
      );
      navigate(hasHostelCode ? "/pending-approval" : "/student/dashboard", {
        replace: true,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      show(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const codeError =
    codeState === "invalid"
      ? "Invalid hostel code. Please check with your landlord."
      : undefined;
  const codeHint =
    codeState === "checking"
      ? "Checking code..."
      : codeState === "valid"
        ? "Hostel code verified."
        : "Optional — you can link a hostel later with its code.";

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Create a student account</h1>
      <p className={styles.subtitle}>
        Create your account first, then link a hostel whenever you&apos;re ready.
      </p>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="At least 6 characters."
          required
        />
        <Input
          label="Hostel code (optional)"
          value={hostelCode}
          onChange={(e) => {
            const value = e.target.value;
            setHostelCode(value);
            setCodeState(value.trim() ? "checking" : "idle");
          }}
          hint={codeHint}
          error={codeError}
        />

        {error && <p className={styles.formError}>{error}</p>}

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={!formValid}
          loading={submitting}
        >
          Create Account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
