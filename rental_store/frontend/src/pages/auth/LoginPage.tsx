import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { ROLE_HOME } from "../../constants/roles";
import type { UserRole } from "../../types/user";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectFor = (role: UserRole): string => {
    const requested = searchParams.get("redirect");
    const from = requested?.startsWith("/") ? requested : location.state?.from?.pathname;
    if (!from) return ROLE_HOME[role];

    // A login may have been triggered by a protected URL. Only restore it
    // when it belongs to the newly authenticated user's role; otherwise the
    // role guard would correctly show 403 instead of the user's dashboard.
    const roleRoot = ROLE_HOME[role].slice(0, ROLE_HOME[role].lastIndexOf("/"));
    return from === "/student/change-hostel" || from.startsWith("/student/change-hostel?")
      ? role === "STUDENT"
        ? from
        : ROLE_HOME[role]
      : from === roleRoot || from.startsWith(`${roleRoot}/`)
      ? from
      : ROLE_HOME[role];
  };

  const signUpPath = searchParams.get("redirect")
    ? `/register/student?redirect=${encodeURIComponent(searchParams.get("redirect") ?? "")}`
    : "/register/student";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await login(email, password);
      show("Signed in successfully", "success");
      navigate(redirectFor(session.user.role), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>
        Sign in to manage your hostel experience.
      </p>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={error ?? undefined}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className={styles.links}>
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to={signUpPath}>Create account</Link>
      </div>
    </div>
  );
}
