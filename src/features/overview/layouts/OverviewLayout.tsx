import { Outlet } from "react-router-dom";
import { TasksProvider } from "../../tasks/context/TasksContext";
import styles from "./OverviewLayout.module.scss";

export function OverviewLayout() {
  return (
    <TasksProvider>
      <div className={styles.page}>
        <Outlet />
      </div>
    </TasksProvider>
  );
}
