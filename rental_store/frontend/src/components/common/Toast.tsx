import { useToast } from "../../hooks/useToast";
import styles from "./Toast.module.css";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  return (
    <div className={styles.viewport} aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.tone]}`}
          role="status"
        >
          <span className={styles.message}>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className={styles.close}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
