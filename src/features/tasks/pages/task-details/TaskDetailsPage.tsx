import { Navigate, useParams } from "react-router-dom";
import { useMemo } from "react";

import { BackToTasksButton } from "../../components/buttons/back-to-tasks-button/BackToTasksButton.tsx";
import TaskDetailsTabulator from "../../components/tabulator/details/Tabulator.tsx";
import { taskService } from "../../api/task-service";
import { useTasks } from "../../hooks/useTasks.ts";

import styles from "./TaskDetailsPage.module.scss";

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { tasks } = useTasks();

  const task = useMemo(
    () => (id ? taskService.getTaskById(id) : undefined),
    [id, tasks],
  );

  if (!task) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <BackToTasksButton />
      </header>

      <TaskDetailsTabulator task={task} />
    </div>
  );
}
