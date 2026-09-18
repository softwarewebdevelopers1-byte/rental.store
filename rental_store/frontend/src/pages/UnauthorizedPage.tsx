import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import styles from "./NotFoundPage.module.css";

export default function UnauthorizedPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>403</div>
      <h1 className={styles.title}>Access denied</h1>
      <p className={styles.subtitle}>
        You don't have permission to view this page.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
