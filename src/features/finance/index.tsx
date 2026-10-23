import { Outlet } from "react-router-dom";

import styles from "./finance.module.scss";

export function FinanceLayout() {
  return (
    <div className={styles.financePage}>
      <Outlet />
    </div>
  );
}

export function FinanceSection() {
  return (
    <div className={styles.sectionPage}>
      <p className={styles.pageHint}>In development...</p>
    </div>
  );
}

export { FinanceDashboard } from "./FinanceDashboard";
