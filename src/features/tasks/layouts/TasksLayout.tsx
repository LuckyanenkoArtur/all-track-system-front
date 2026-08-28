import { Outlet } from "react-router-dom";
import { TasksProvider } from "../context/TasksContext";
import styles from "./TasksLayout.module.scss";

export function TasksLayout() {
  return (
    <TasksProvider>
      <div className={styles.tasksPage}>
        <Outlet />
      </div>
    </TasksProvider>
  );
}
