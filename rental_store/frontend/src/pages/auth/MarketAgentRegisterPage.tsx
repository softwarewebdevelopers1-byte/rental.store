import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./StudentRegisterPage.module.css";

export default function MarketAgentRegisterPage() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Market agent registration</h1>
      <p className={styles.subtitle}>
        Market agent onboarding is by invitation only. Use your invitation link
        to continue. Contact the platform admin if you need a new invite.
      </p>
      <Link to="/login">
        <Button fullWidth size="lg">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
