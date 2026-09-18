import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./PendingApprovalPage.module.css";

export default function PendingApprovalPage() {
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
      </div>
    </div>
  );
}
