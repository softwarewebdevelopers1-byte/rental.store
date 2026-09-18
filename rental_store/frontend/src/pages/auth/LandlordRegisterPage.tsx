import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./StudentRegisterPage.module.css";

export default function LandlordRegisterPage() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Landlord registration</h1>
      <p className={styles.subtitle}>
        Landlord sign-up is by invitation only. Please use the invitation link
        your admin shared with you. If you don't have one, contact support.
      </p>
      <Link to="/login">
        <Button fullWidth size="lg">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
