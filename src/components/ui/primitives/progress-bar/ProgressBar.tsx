import {
  createContext,
  useContext,
  type FC,
  type PropsWithChildren,
} from "react";
import styles from "./ProgressBar.module.scss";

type ProgressBarContextValue = {
  completed: number;
  total: number;
  percent: number;
};

const ProgressBarContext = createContext<ProgressBarContextValue | null>(null);

const useProgressBar = () => {
  const context = useContext(ProgressBarContext);

  if (!context) {
    throw new Error("ProgressBar components must be used inside <ProgressBar>");
  }

  return context;
};

type ProgressBarProps = PropsWithChildren & {
  completed: number;
  total: number;
};

interface ProgressBarComponent extends FC<ProgressBarProps> {
  Header: FC<ProgressBarHeaderProps>;
  Body: FC;
}

interface ProgressBarHeaderProps {
  text: string;
}

const ProgressBar: ProgressBarComponent = ({ completed, total, children }) => {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <ProgressBarContext.Provider
      value={{
        completed,
        total,
        percent,
      }}
    >
      <div className={styles.root}>{children}</div>
    </ProgressBarContext.Provider>
  );
};

ProgressBar.Header = ({ text }: ProgressBarHeaderProps) => {
  const { completed, total, percent } = useProgressBar();

  return (
    <div className={styles.progressHeader}>
      <span className={styles.progressLabel}>{text}</span>
      <span className={styles.progressValue}>
        {completed}/{total} ({percent}%)
      </span>
    </div>
  );
};

ProgressBar.Body = () => {
  const { percent } = useProgressBar();

  return (
    <div className={styles.progressBar} aria-hidden>
      <span className={styles.progressFill} style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
