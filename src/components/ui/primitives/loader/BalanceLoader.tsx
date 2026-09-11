import { FiClock, FiDollarSign, FiZap } from "react-icons/fi";
import { useTranslation } from "../../../../i18n";
import styles from "./BalanceLoader.module.scss";

export default function BalanceLoader() {
  const { t } = useTranslation();
  const labels = t.common.loader;

  return (
    <div
      className={styles.root}
      role="status"
      aria-live="polite"
      aria-label={labels.label}
    >
      <div className={styles.orbit} aria-hidden>
        <svg className={styles.ring} viewBox="0 0 200 200">
          <circle className={styles.ringTrack} cx="100" cy="100" r="72" />
          <circle className={styles.ringFlow} cx="100" cy="100" r="72" />
        </svg>

        <div className={styles.hub}>
          <span className={styles.hubPulse} />
          <span className={styles.hubCore} />
        </div>

        <div className={`${styles.node} ${styles.nodeTime}`}>
          <FiClock />
        </div>
        <div className={`${styles.node} ${styles.nodeBudget}`}>
          <FiDollarSign />
        </div>
        <div className={`${styles.node} ${styles.nodeEnergy}`}>
          <FiZap />
        </div>
      </div>
    </div>
  );
}
