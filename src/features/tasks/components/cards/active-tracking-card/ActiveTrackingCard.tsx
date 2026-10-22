import { useNavigate } from "react-router-dom";
import { FiSquare } from "react-icons/fi";

import { useTasks } from "../../../hooks/useTasks";
import { useTrackingTimer } from "../../../hooks/useTrackingTimer";
import {
  formatSessionTimer,
  getLiveTimeSpent,
} from "../../../utils/timeTrackingUtils";
import styles from "./ActiveTrackingCard.module.scss";

type ActiveTrackingCardProps = {
  labels: {
    title: string;
    session: string;
    totalTime: string;
    stop: string;
  };
  compact?: boolean;
};

export function ActiveTrackingCard({
  labels,
  compact = false,
}: ActiveTrackingCardProps) {
  useTrackingTimer();
  const navigate = useNavigate();
  const { tracking, tasks, stopTracking, getTrackingElapsedMs } = useTasks();

  if (!tracking) return null;

  const task = tasks.find((item) => item.id === tracking.taskId);
  if (!task) return null;

  const elapsedMs = getTrackingElapsedMs();
  const session = formatSessionTimer(elapsedMs);

  if (compact) {
    return (
      <div className={styles.compact} aria-live="polite">
        <button
          type="button"
          className={styles.compactMain}
          onClick={() => navigate(`/app/tasks/${task.id}`)}
          title={task.title}
        >
          <span className={styles.compactIndicator} aria-hidden>
            <span className={styles.compactPulse} />
          </span>
          <span className={styles.compactText}>
            <span className={styles.compactEyebrow}>{labels.title}</span>
            <span className={styles.compactTitle}>{task.title}</span>
          </span>
          <strong className={styles.compactTimer}>{session}</strong>
        </button>
        <button
          type="button"
          className={styles.compactStop}
          onClick={stopTracking}
          aria-label={labels.stop}
          title={labels.stop}
        >
          <FiSquare size={12} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <section className={styles.card} aria-live="polite">
      <div className={styles.indicator} aria-hidden>
        <span className={styles.pulse} />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>{labels.title}</p>
        <h2 className={styles.taskTitle}>{task.title}</h2>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>{labels.session}</span>
            <strong className={styles.sessionTimer}>{session}</strong>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>{labels.totalTime}</span>
            <strong>{getLiveTimeSpent(task.timeSpent, elapsedMs)}</strong>
          </div>
        </div>
      </div>

      <button type="button" className={styles.stopBtn} onClick={stopTracking}>
        <FiSquare size={14} aria-hidden />
        {labels.stop}
      </button>
    </section>
  );
}
