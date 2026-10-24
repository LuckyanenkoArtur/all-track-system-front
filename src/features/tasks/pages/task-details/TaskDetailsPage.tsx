import { Navigate, useLocation, useParams } from "react-router-dom";
import { useMemo } from "react";

import { useTranslation } from "../../../../i18n/index.ts";
import { useProjects } from "../../../projects/store/projects.store.ts";
import BackToTasksButton from "../../components/buttons/back-to-tasks-button/BackToTasksButton.tsx";
import { TaskOverviewHeader } from "../../components/tabs/task-details/overview/TaskOverviewHeader.tsx";
import TaskDetailsTabulator from "../../components/tabulator/details/Tabulator.tsx";
import { useTasks } from "../../hooks/useTasks.ts";

import styles from "./TaskDetailsPage.module.scss";

export function TaskDetailsPage() {
  const { id, projectId, taskId } = useParams<{
    id?: string;
    projectId?: string;
    taskId?: string;
  }>();
  const { t } = useTranslation();
  const location = useLocation();
  const { tasks } = useTasks();
  const detailsTab = (location.state as { detailsTab?: string } | null)?.detailsTab;
  const projects = useProjects();
  const resolvedId = taskId ?? id;

  const task = useMemo(
    () => tasks.find((item) => item.id === resolvedId) ?? null,
    [tasks, resolvedId],
  );

  const project = projectId
    ? (projects.find((item) => item.id === projectId) ?? null)
    : null;

  if (!task || (projectId && (!project || task.project !== projectId))) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <BackToTasksButton
          to={project ? `/app/projects/${project.id}` : "/app/tasks"}
          state={project ? { tab: "tasks" } : undefined}
          label={project ? t.projects.details.backToProject : undefined}
        />
        <TaskOverviewHeader
          id={task.id}
          title={task.title}
          requiresResultReview={task.requiresResultReview}
          initiator={task.initiator}
          createdAt={task.createdAt}
        />
      </header>

      <TaskDetailsTabulator task={task} initialTab={detailsTab} />
    </div>
  );
}
