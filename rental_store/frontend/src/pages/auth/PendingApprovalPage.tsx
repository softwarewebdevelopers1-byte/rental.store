import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { useToast } from "../../hooks/useToast";
import { studentService } from "../../services/studentService";
import styles from "./PendingApprovalPage.module.css";

export default function PendingApprovalPage() {
  const { show } = useToast();
  const [hasRequest, setHasRequest] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    void studentService.getSelf().then((student) => {
      setHasRequest(!!student?.requestedHostelId);
    });
  }, []);

  async function cancelRequest() {
    setCancelling(true);
    try {
      await studentService.cancelHostelRequest();
      setHasRequest(false);
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

  return (
    <div className={styles.wrap}>
      <div className={styles.icon} aria-hidden>
        ⏳
      </div>
      <h1 className={styles.title}>Awaiting landlord approval</h1>
      <p className={styles.description}>
        Your student account has been created. Your hostel membership is
        currently
        <strong> PENDING</strong>. You'll become an active tenant once your
        landlord accepts your request.
      </p>
      <div className={styles.actions}>
        <Link to="/student/dashboard">
          <Button variant="secondary">Go to dashboard</Button>
        </Link>
        <Link to="/hostels">
          <Button>Browse hostels</Button>
        </Link>
        {hasRequest && (
          <Button
            variant="danger"
            onClick={() => void cancelRequest()}
            loading={cancelling}
          >
            Cancel request
          </Button>
        )}
      </div>
    </div>
  );
}
