import { useMemo, useState } from "react";
import { useUserProfile } from "../../../context/UserProfileContext";
import { useTranslation } from "../../../i18n";
import Title from "@primitive/title/Title.tsx";

import { TaskCreationButton } from "../../tasks/components/buttons/task-creation-button/TaskCreationButton";
import { ActiveTrackingCard } from "../../tasks/components/cards/active-tracking-card/ActiveTrackingCard.tsx";
import { TaskDetailsDrawer } from "../../tasks/components/drawers/task-details-drawer/Drawer.tsx";
import { DrawerDismissContext } from "@overlay/drawer/Drawer.tsx";
import { useTasks } from "../../tasks/hooks/useTasks";
import { useTaskListState } from "../../tasks/hooks/useTaskListState";
import { getAuthorInitials } from "../../tasks/utils/commentUtils";
import styles from "./OverviewPage.module.scss";
import TaskTabulator from "../components/tabulator/Tabulator.tsx";
import { CompleteTaskDrawer } from "../../tasks/components/drawers/task-complete-drawer/Drawer.tsx";
import { ProjectSummaryCards } from "../../projects/components/project-summary/ProjectSummaryCards.tsx";
import { useProjects } from "../../projects/store/projects.store.ts";

export function OverviewPage() {
  const { t } = useTranslation();
  const { bio } = useUserProfile();
  const { tasks, addTask, completeTaskWithReport } = useTasks();
  const projects = useProjects();
  const { filterOptions } = useTaskListState();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsInitialTab, setDetailsInitialTab] = useState<string | undefined>();
  const [completeTaskId, setCompleteTaskId] = useState<string | null>(null);

  const labels = t.tasks.dashboard;
  const taskLabels = t.tasks;
  const detailLabels = taskLabels.details;

  const initiatorName =
    `${bio.firstName} ${bio.lastName}`.trim() || bio.username;
  const authorName = initiatorName;
  const authorInitials = getAuthorInitials(authorName);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const handleCompleteTask = (input: {
    description: string;
    steps: { id: string; text: string }[];
  }) => {
    if (!completeTaskId) return;

    completeTaskWithReport({
      taskId: completeTaskId,
      description: input.description,
      steps: input.steps,
      author: authorName,
      authorInitials,
    });
  };

  return (
    <DrawerDismissContext.Provider value={() => setSelectedTaskId(null)}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <Title text={t.sidebar.tasksOverview} />
          <TaskCreationButton
            onSubmit={addTask}
            initiatorName={initiatorName}
            filterOptions={filterOptions}
          />
        </header>

        {/*! Is the Tracking Card displayed when task is tracking */}
        <ProjectSummaryCards projects={projects} />

        <ActiveTrackingCard
          labels={{
            title: t.tasks.trackingActive,
            session: t.tasks.session,
            totalTime: t.tasks.totalTime,
            stop: t.tasks.stopTracking,
          }}
        />

        <TaskTabulator
          onTaskClick={(taskId) => {
            setDetailsInitialTab(undefined);
            setSelectedTaskId(taskId);
          }}
        />

        <TaskDetailsDrawer task={selectedTask} initialTab={detailsInitialTab} />

        {/* Repeated dialogs for Task Details Panel */}
        <CompleteTaskDrawer
          open={completeTaskId !== null}
          onClose={() => setCompleteTaskId(null)}
          onSubmit={handleCompleteTask}
          labels={{
            title: detailLabels.completeDialogTitle,
            subtitle: detailLabels.completeDialogSubtitle,
            description: detailLabels.completionDescription,
            descriptionPlaceholder:
              detailLabels.completionDescriptionPlaceholder,
            required: labels.required,
            steps: detailLabels.completionSteps,
            addStep: labels.addStep,
            stepPlaceholder: labels.stepPlaceholder,
            removeStep: labels.removeStep,
            apply: detailLabels.completeApply,
            cancel: t.common.cancel,
          }}
        />
      </div>
    </DrawerDismissContext.Provider>
  );
}

export default OverviewPage;
