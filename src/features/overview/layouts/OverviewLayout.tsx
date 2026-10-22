import { Outlet } from "react-router-dom";
import styles from "./OverviewLayout.module.scss";

export function OverviewLayout() {
  return (
    <div className={styles.page}>
      <Outlet />
    </div>
  );
}
