import type { PropsWithChildren, ReactNode } from "react";

import styles from "./Thread.module.scss";

type ThreadProps = PropsWithChildren<{
  "aria-label": string;
  title?: ReactNode;
  className?: string;
}>;

export function Thread({
  "aria-label": ariaLabel,
  title,
  children,
  className = "",
}: ThreadProps) {
  return (
    <section
      className={`${styles.root} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {title != null && <div className={styles.title}>{title}</div>}

      <div className={styles.scrollRegion}>
        <div className={styles.list}>{children}</div>
      </div>
    </section>
  );
}
