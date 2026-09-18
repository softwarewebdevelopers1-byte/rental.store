import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { ROLE_HOME } from "../../constants/roles";
import type { UserRole } from "../../types/user";
import styles from "./LoginPage.module.css";

const DEMO_ROLES: { role: UserRole; label: string }[] = [
  { role: "STUDENT", label: "Student Demo" },
  { role: "LANDLORD", label: "Landlord Demo" },
  { role: "CARETAKER", label: "Caretaker Demo" },
  { role: "MARKET_AGENT", label: "Market Agent Demo" },
  { role: "ADMIN", label: "Admin Demo" },
];

export default function LoginPage() {
  const { login, loginAsRole, user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectFor = (role: UserRole): string =>
    location.state?.from?.pathname ?? ROLE_HOME[role];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      show("Signed in successfully", "success");
      // useAuth state updates; navigate based on resolved user
      const path = user ? redirectFor(user.role) : "/";
      navigate(path, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function onDemo(role: UserRole) {
    setLoading(true);
    try {
      await loginAsRole(role);
      show(`Signed in as ${role}`, "success");
      navigate(ROLE_HOME[role], { replace: true });
    } catch (err) {
      show(err instanceof Error ? err.message : "Demo sign-in failed", "error");
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
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={error ?? undefined}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className={styles.links}>
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register/student">Create account</Link>
      </div>

      <div className={styles.demo}>
        <p className={styles.demoTitle}>Or use a demo account</p>
        <div className={styles.demoGrid}>
          {DEMO_ROLES.map((d) => (
            <Button
              key={d.role}
              variant="secondary"
              size="sm"
              onClick={() => void onDemo(d.role)}
              disabled={loading}
            >
              {d.label}
            </Button>
          ))}
        </div>
        <p className={styles.hint}>
          All demo passwords are <code>password</code>.
        </p>
      </div>
    </div>
  );
}
