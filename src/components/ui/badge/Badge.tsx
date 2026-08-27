import type { PropsWithChildren } from "react";
import styles from "./Badge.module.scss";

export type BadgeVariant = "success" | "info" | "error" | "neutral" | "warning";

type BadgeProps = PropsWithChildren & {
  variant: BadgeVariant;
  className?: string;
  compact?: boolean;
};

const Badge = ({
  children,
  variant,
  className,
  compact = false,
}: BadgeProps) => {
  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${compact ? styles.compact : ""} ${className ?? ""}`.trim()}
    >
      {children}
    </span>
  );
};

export default Badge;

Badge.Icon = ({ children }: PropsWithChildren) => {
  return <span className={styles.icon}>{children}</span>;
};

Badge.Label = ({ children }: PropsWithChildren) => {
  return <span className={styles.label}>{children}</span>;
};
