import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { EmptyState } from "../../components/common/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { hostelService } from "../../services/hostelService";
import { mockStudents } from "../../data/users";
import styles from "./ChangeHostelPage.module.css";

export default function ChangeHostelPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const student = mockStudents.find((item) => item.id === user?.id);
  const isLinking = !student?.hostelId;
  const [code, setCode] = useState("");
  const [hostelName, setHostelName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function findHostel() {
    const hostel = await hostelService.findByCode(code);
    setHostelName(hostel?.name ?? null);
    if (!hostel) show("That hostel code is not valid.", "error");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!student || !hostelName) return;
    setSubmitting(true);
    try {
      const hostel = await hostelService.findByCode(code);
      if (!hostel) return;
      student.requestedHostelId = hostel.id;
      student.membershipStatus = "PENDING";
      show(
        isLinking
          ? "Your hostel link request was submitted."
          : "Your hostel change request was submitted.",
        "success",
      );
      navigate("/student/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  if (!student) {
    return <EmptyState title="Student profile unavailable" description="Please sign in again to request a hostel change." action={<Link to="/login">Sign in</Link>} />;
  }

  return (
    <div className={styles.wrap}>
      <PageHeader
        title={isLinking ? "Link a hostel" : "Change hostel"}
        subtitle={
          isLinking
            ? "Enter the linking code shared by your hostel."
            : "Enter the invitation code for your new hostel."
        }
      />
      <Card>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            label="Hostel linking code"
            value={code}
            onChange={(event) => { setCode(event.target.value.toUpperCase()); setHostelName(null); }}
            hint="Ask the landlord for the hostel code."
            required
          />
          <Button type="button" variant="secondary" onClick={() => void findHostel()} disabled={!code.trim()}>Check code</Button>
          {hostelName && (
            <div className={styles.success}>
              <span className={styles.icon} aria-hidden>✓</span>
              <h3>{hostelName}</h3>
              <p>Submit the request and wait for the landlord&apos;s approval.</p>
              <Button type="submit" loading={submitting}>
                {isLinking ? "Link hostel" : "Request change"}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
