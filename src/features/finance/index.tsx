import { Outlet } from "react-router-dom";

import Title from "@primitive/title/Title.tsx";
import styles from "./finance.module.scss";

export function FinanceLayout() {
  return (
    <div className={styles.financePage}>
      <Outlet />
    </div>
  );
}

export function FinanceSection({ title }: { title: string }) {
  return (
    <div className={styles.sectionPage}>
      <Title text={title} />
      <p className={styles.pageHint}>In development...</p>
    </div>
  );
}

export { FinanceDashboard } from "./FinanceDashboard";
