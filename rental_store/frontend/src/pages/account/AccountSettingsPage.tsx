import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { PhoneInput } from "../../components/common/PhoneInput";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { accountService } from "../../services/accountService";
import { FileUpload } from "../../components/common/FileUpload";
import { validatePhone } from "../../utils/phone";
import styles from "./AccountSettingsPage.module.css";

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth();
  const { show } = useToast();
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPhone(user?.phone ?? "");
  }, [user?.phone]);

  useEffect(() => {
    let active = true;
    void accountService.getCurrent().then((current) => {
      if (!active) return;
      setEmail(current.email);
      setPhone(current.phone ?? "");
      setAvatarUrl(current.avatarUrl ?? "");
      updateUser(current);
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : "Unable to load account settings.");
    });
    return () => {
      active = false;
    };
  }, [updateUser]);

  const phoneError = validatePhone(phone, true);
  const tPhoneError = (key: string | null) => {
    switch (key) {
      case "required":
        return "Phone number is required.";
      case "invalid":
        return "Please enter a valid phone number.";
      case "tooShort":
        return "Phone number is too short.";
      case "tooLong":
        return "Phone number is too long.";
      case "invalidChars":
        return "Phone number can only contain digits, spaces, +, -, and parentheses.";
      default:
        return undefined;
    }
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await accountService.update({
        email: email.trim(),
        phone: phone.trim(),
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      updateUser(updated);
      setCurrentPassword("");
      setNewPassword("");
      show("Account settings updated.", "success");
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : "Unable to update account settings.";
      setError(message);
      show(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <PageHeader title="Account settings" subtitle="Update your email address, avatar, or password." />
      <Card>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <PhoneInput label="Phone" value={phone} onChange={setPhone} required defaultCountry="KE" error={phoneError ? tPhoneError(phoneError) : undefined} />
          <FileUpload
            folder="avatars"
            label="Profile photo"
            value={avatarUrl ? [avatarUrl] : []}
            onChange={(urls) => setAvatarUrl(urls[0] ?? "")}
          />
          <h2 className={styles.sectionTitle}>Change password</h2>
          <Input
            label="Current password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            endAdornment={
              <button type="button" onClick={() => setShowCurrentPassword((visible) => !visible)} aria-label={showCurrentPassword ? "Hide current password" : "Show current password"} aria-pressed={showCurrentPassword}>
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <Input
            label="New password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            hint="Leave blank if you only want to change your email."
            endAdornment={
              <button type="button" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? "Hide new password" : "Show new password"} aria-pressed={showNewPassword}>
                {showNewPassword ? "Hide" : "Show"}
              </button>
            }
          />
          {error && <p className={styles.formError}>{error}</p>}
          <Button type="submit" loading={submitting}>Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
