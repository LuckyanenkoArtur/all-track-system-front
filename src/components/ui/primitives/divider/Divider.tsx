import type { ReactNode } from "react";

import styles from "./Divider.module.scss";

type DividerProps = {
  icon?: ReactNode;
  className?: string;
};

export default function Divider({ icon, className = "" }: DividerProps) {
  return (
    <div className={`${styles.divider} ${className}`.trim()} aria-hidden>
      {icon}
    </div>
  );
}
