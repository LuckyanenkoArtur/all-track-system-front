import { Navigate, useParams } from "react-router-dom";

import { BackToTasksButton } from "../../components/buttons/back-to-tasks-button/BackToTasksButton.tsx";
import TaskDetailsTabulator from "../../components/tabulator/details/Tabulator.tsx";

import styles from "./TaskDetailsPage.module.scss";
import { useTasks } from "../../hooks/useTasks.ts";


export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();

  //!--------------------------------------------------------------------------------------------------- #
  //! Here should be a request to the server to get the task details by using TaskService.getTaskById(id)#
  //!--------------------------------------------------------------------------------------------------- #
  const { tasks } = useTasks();
  const task = tasks.find((item) => item.id === id);
  //!--------------------------------------------------------------------------------------------------- #

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
