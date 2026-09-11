import { Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import BalanceLoader from "@primitive/loader/BalanceLoader.tsx";

import BackToTasksButton from "../../components/buttons/back-to-tasks-button/BackToTasksButton.tsx";
import TaskDetailsTabulator from "../../components/tabulator/details/Tabulator.tsx";

import useTasksStore from "../../store/tasks.store.ts";

import styles from "./TaskDetailsPage.module.scss";

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const task = useTasksStore((state: any) => state.task);
  const loading = useTasksStore((state: any) => state.loading);
  const getTaskById = useTasksStore((state: any) => state.getTaskById);

  useEffect(() => {
    if (id) {
      getTaskById(id);
    }
  }, [id, getTaskById]);

  if (loading) {
    return (
      <div className={styles.page}>
        <BalanceLoader />
      </div>
    );
  }

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
