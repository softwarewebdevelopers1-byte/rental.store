import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  policies,
  policyKeyToUrlSlug,
  urlSlugToPolicyKey,
} from "../../content/policies";
import styles from "./PolicyPage.module.css";

export default function PolicyPage() {
  const navigate = useNavigate();
  const { policyKey } = useParams();
  const resolvedKey = policyKey ? urlSlugToPolicyKey(policyKey) : "platform";
  const policy = policies[resolvedKey];
  const isUnknown = !policyKey || policyKey !== policyKeyToUrlSlug(resolvedKey);

  useEffect(() => {
    if (isUnknown) {
      navigate("/policies/platform", { replace: true });
    }
  }, [isUnknown, navigate]);

  if (isUnknown) {
    return null;
  }

  const formattedDate = new Date(policy.lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleBack = () => {
    if (window.history.length <= 1) {
      navigate("/", { replace: true });
      return;
    }

    navigate(-1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <button type="button" className={styles.backLink} onClick={handleBack}>
          Back
        </button>
      </div>

      <h1 className={styles.title}>{policy.title}</h1>
      <p className={styles.subtitle}>Last updated {formattedDate}</p>
      <div className={styles.summary}>{policy.summary}</div>

      {policy.sections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul className={styles.list}>
              {section.bullets.map((bullet) => (
                <li key={bullet} className={styles.listItem}>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <div className={styles.footerActions}>
        <button type="button" className={styles.primaryButton} onClick={handleBack}>
          I have read this policy
        </button>
      </div>
    </div>
  );
}
