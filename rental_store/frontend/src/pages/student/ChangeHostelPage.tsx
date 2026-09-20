import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { EmptyState } from "../../components/common/EmptyState";
import { useToast } from "../../hooks/useToast";
import { hostelService } from "../../services/hostelService";
import { studentService } from "../../services/studentService";
import type { Student } from "../../types/user";
import styles from "./ChangeHostelPage.module.css";

export default function ChangeHostelPage() {
  const { show } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    let cancelled = false;
    void studentService
      .getSelf()
      .then((profile) => {
        if (!cancelled) setStudent(profile);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isLinking = !student?.hostelId;
  const [code, setCode] = useState(() => searchParams.get("code")?.toUpperCase() ?? "");
  const [hostelName, setHostelName] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function findHostel() {
    setChecking(true);
    setHostelName(null);
    try {
      const hostel = await hostelService.findByCode(code);
      if (!hostel) {
        show("That hostel code is not valid.", "error");
        return;
      }
      setHostelName(hostel.name);
      show(`Hostel code verified for ${hostel.name}.`, "success");
    } catch (error) {
      show(
        error instanceof Error && error.message
          ? error.message
          : "Unable to check the hostel code. Please try again.",
        "error",
      );
    } finally {
      setChecking(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!student || !hostelName) return;
    setSubmitting(true);
    try {
      const updatedStudent = await studentService.changeHostel(code);
      setStudent(updatedStudent);
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

  async function cancelRequest() {
    setCancelling(true);
    try {
      setStudent(await studentService.cancelHostelRequest());
      show("Your hostel request was cancelled.", "success");
    } catch (error) {
      show(
        error instanceof Error ? error.message : "Unable to cancel the request.",
        "error",
      );
    } finally {
      setCancelling(false);
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
      {student.hostelId && (
        <Card>
          <div className={styles.currentHostel}>
            <span className={styles.currentHostelLabel}>Current hostel</span>
            <h2>{student.hostelName ?? "Current hostel"}</h2>
            {student.hostelLocation && <p>{student.hostelLocation}</p>}
            {student.roomNumber && <p>Room {student.roomNumber}</p>}
          </div>
        </Card>
      )}
      {student.requestedHostelId && (
        <Card>
          <div className={styles.success}>
            <span className={styles.icon} aria-hidden>✓</span>
            <h3>Hostel request pending</h3>
            <p>
              Your request to join{" "}
              <strong>{student.requestedHostelName ?? "this hostel"}</strong>{" "}
              is waiting for landlord approval.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void cancelRequest()}
              loading={cancelling}
            >
              Cancel request
            </Button>
          </div>
        </Card>
      )}
      {!student.requestedHostelId && (
      <Card>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            label="Hostel linking code"
            value={code}
            onChange={(event) => { setCode(event.target.value.toUpperCase()); setHostelName(null); }}
            hint="Ask the landlord for the hostel code."
            required
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => void findHostel()}
            disabled={!code.trim()}
            loading={checking}
          >
            Check code
          </Button>
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
      )}
    </div>
  );
}
