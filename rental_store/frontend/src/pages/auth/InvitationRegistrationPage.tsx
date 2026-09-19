import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { invitationService } from "../../services/invitationService";
import { ROLE_HOME } from "../../constants/roles";
import type { Invitation, InvitationKind } from "../../types/invitation";
import styles from "./StudentRegisterPage.module.css";

const roleLabels: Record<InvitationKind, string> = {
  LANDLORD: "Landlord",
  MARKET_AGENT: "Market agent",
  CARETAKER: "Caretaker",
};

export default function InvitationRegistrationPage() {
  const { token } = useParams<{ token: string }>();
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(
    token ? null : "This invitation link is incomplete.",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    void invitationService
      .getByToken(token)
      .then((value) => {
        if (cancelled) return;
        if (
          value.status !== "ACTIVE" ||
          new Date(value.expiresAt).getTime() <= Date.now()
        ) {
          setError("This invitation is no longer active.");
          return;
        }
        setInvitation(value);
        setEmail(value.email ?? "");
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Invitation not found.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !invitation) return;
    if (!email.trim()) {
      setError("An email address is required to create your account.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await invitationService.redeem(token, {
        name: name.trim(),
        email: email.trim(),
        password,
        ...(businessName.trim() ? { businessName: businessName.trim() } : {}),
      });
      const session = await login(email.trim(), password);
      show("Account created successfully.", "success");
      navigate(ROLE_HOME[session.user.role], { replace: true });
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Checking invitation..." />;

  if (error || !invitation) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Invitation unavailable</h1>
        <p className={styles.formError}>{error ?? "This invitation could not be loaded."}</p>
        <Link to="/login">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Create your {roleLabels[invitation.kind]} account</h1>
      <p className={styles.subtitle}>
        Complete your registration using the invitation shared with you.
      </p>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        <Input
          label="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          readOnly={!!invitation.email}
          required
        />
        {invitation.kind === "MARKET_AGENT" && (
          <Input
            label="Business name (optional)"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            autoComplete="organization"
          />
        )}
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error && <p className={styles.formError}>{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={submitting}>
          Create account
        </Button>
      </form>
    </div>
  );
}
