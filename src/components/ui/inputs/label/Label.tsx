import type { FC, PropsWithChildren } from "react";

import styles from "./Label.module.scss";

export const Label: FC<PropsWithChildren> = ({ children }) => {
  return <span className={styles.label}>{children}</span>;
};
