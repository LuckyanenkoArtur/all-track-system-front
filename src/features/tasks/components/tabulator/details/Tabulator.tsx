import type { Task } from "../../../domain/task";
import { Tabulator } from "@nav/tabulator/Tabulator.tsx";
import { useTranslation } from "../../../../../i18n/index.ts";

import { AiOutlineDashboard } from "react-icons/ai";
import { FaComments } from "react-icons/fa6";
import { IoDocuments } from "react-icons/io5";
import { MdOutlineHistory } from "react-icons/md";
import { TaskDetailsCommentsTab } from "../../tabs/task-details/comments/TaskDetailsCommentsTab.tsx";
import { useTasks } from "../../../hooks/useTasks.ts";
import { useMemo, useState, useCallback } from "react";
import { getAuthorInitials } from "../../../utils/commentUtils.ts";
import { useUserProfile } from "../../../../../context/UserProfileContext.tsx";
import { TaskDetailsHistoryTab } from "../../tabs/task-details/history/Tab.tsx";
import { useTaskTrackingDisplay } from "../../../hooks/useTaskTrackingDisplay.ts";
import { getLiveTimeSpent } from "../../../utils/timeTrackingUtils.ts";
import { TaskDetailsOverviewTab } from "../../tabs/task-details/overview/TaskDetailsOverviewTab.tsx";
import { TaskDetailsMetricsTab } from "../../tabs/task-details/metrics/TaskDetailsMetricsTab.tsx";
import { useTaskListState } from "../../../hooks/useTaskListState.ts";
import { TaskCreationDrawer } from "../../drawers/task-creation-drawer/Drawer.tsx";
import {
  FiFileText,
  FiBarChart2,
  FiClipboard,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import { TaskDetailsNotesTab } from "../../tabs/task-details/notes/TaskDetailsNotesTab.tsx";
import { TaskDetailsTimeTab } from "../../tabs/task-details/time/TaskDetailsTimeTab.tsx";
import { TaskDetailsTransactionsTab } from "../../tabs/task-details/transactions/TaskDetailsTransactionsTab.tsx";
import { TaskDetailsTabPlaceholder } from "../../placeholders/TaskDetailsTabPlaceholder.tsx";
import { isUserTaskResponsible } from "../../../utils/taskDetailsUtils.ts";
import { isTerminalTaskStatus } from "../../../utils/taskStatusUtils.ts";
import { CompleteTaskDrawer } from "../../drawers/task-complete-drawer/Drawer.tsx";

interface TaskDetailsTabulatorProps {
  task: Task;
  initialTab?: string;
}

export default function TaskDetailsTabulator({
  task,
  initialTab,
}: TaskDetailsTabulatorProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;

  //! -------------------REFACTORING------------------------------
  const {
    updateTask,
    updateTaskSteps,
    updateTaskStatus,
    updateTaskPriority,
    getTrackingElapsedMs,
    getTaskComments,
    addTaskComment,
    completeTaskWithReport,
    getTaskHistory,
    getBudgetTransactions,
    addManualTime,
    addBudgetExpense,
    addTaskNote,
  } = useTasks();
  //! ------------------------------------------------------------

  //! -------------------FUNCTIONALITY OF COMMENTS TAB----------------
  const { bio } = useUserProfile();
  const authorName = `${bio.firstName} ${bio.lastName}`.trim() || bio.username;
  const authorInitials = getAuthorInitials(authorName);

  const readOnly = isTerminalTaskStatus(task.status);

  const canToggleSteps = useMemo(
    () => isUserTaskResponsible(authorName, task.responsible),
    [authorName, task.responsible],
  );

  const handleToggleStep = useCallback(
    (stepId: string) => {
      if (readOnly || !canToggleSteps) return;

      const nextSteps = (task.steps ?? []).map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step,
      );
      updateTaskSteps(task.id, nextSteps);
    },
    [canToggleSteps, readOnly, task.id, task.steps, updateTaskSteps],
  );
  //! ------------------------------------------------------------

  //! -------------------FUNCTIONALITY OF STEPS TAB----------------
  //! (steps live in overview tab; toggle restricted to responsible users)
  //! ------------------------------------------------------------

  const taskComments = useMemo(
    () => getTaskComments(task.id),
    [task.id, getTaskComments],
  );

  const handleAddComment = (
    body: string,
    attachments: {
      name: string;
      size: number;
      mimeType: string;
      dataUrl: string;
    }[],
  ) => {
    if (readOnly) return;

    addTaskComment({
      taskId: task.id,
      body,
      author: authorName,
      authorInitials,
      attachments,
    });
  };
  //! ------------------------------------------------------------

  //! -------------------FUNCTIONALITY OF HISTORY TAB-------------
  const taskHistory = useMemo(
    () => getTaskHistory(task.id),
    [task.id, getTaskHistory],
  );

  const taskNotes = useMemo(
    () => taskHistory.filter((entry) => entry.type === "note_added"),
    [taskHistory],
  );

  const taskTimeEntries = useMemo(
    () =>
      taskHistory.filter(
        (entry) =>
          entry.type === "manual_time_added" || entry.type === "time_tracked",
      ),
    [taskHistory],
  );
  //! ------------------------------------------------------------

  //! -------------------FUNCTIONALITY OF OVERVIEW TAB-------------

  const { filterOptions } = useTaskListState();
  const initiatorName =
    `${bio.firstName} ${bio.lastName}`.trim() || bio.username;

  const [editOpen, setEditOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const { isTracking, sessionTimer, toggleTracking } = useTaskTrackingDisplay(
    task.id,
  );

  const liveTimeSpent = useMemo(() => {
    if (!isTracking) return task.timeSpent;
    return getLiveTimeSpent(task.timeSpent, getTrackingElapsedMs());
  }, [task.timeSpent, isTracking, getTrackingElapsedMs]);

  const budgetTransactions = useMemo(
    () => getBudgetTransactions(task.id),
    [task.id, getBudgetTransactions],
  );

  const handleCompleteTask = (input: {
    description: string;
    steps: { id: string; text: string }[];
  }) => {
    completeTaskWithReport({
      taskId: task.id,
      description: input.description,
      steps: input.steps,
      author: authorName,
      authorInitials,
    });
  };

  const groupSelectOptions = useMemo(
    () => filterOptions.groups.map((group) => ({ value: group, label: group })),
    [filterOptions.groups],
  );

  const userSelectOptions = useMemo(() => {
    const users = new Set<string>([
      ...filterOptions.initiators,
      ...filterOptions.responsible,
      ...filterOptions.observables,
      initiatorName,
    ]);
    return [...users].sort().map((user) => ({ value: user, label: user }));
  }, [
    filterOptions.initiators,
    filterOptions.responsible,
    filterOptions.observables,
    initiatorName,
  ]);

  const dashboardLabels = t.tasks.dashboard;
  const taskLabels = t.tasks;
  const detailLabels = t.tasks.details;
  //! ------------------------------------------------------------

  const tabs = [
    {
      id: "overview",
      label: labels.tabs.overview,
      icon: <AiOutlineDashboard size={15} aria-hidden />,
    },
    {
      id: "metrics",
      label: labels.tabs.metrics,
      icon: <FiBarChart2 size={15} aria-hidden />,
    },
    {
      id: "time",
      label: labels.tabs.time,
      icon: <FiClock size={15} aria-hidden />,
    },
    {
      id: "transactions",
      label: labels.tabs.transactions,
      icon: <FiDollarSign size={15} aria-hidden />,
    },
    {
      id: "comments",
      label: labels.tabs.comments,
      icon: <FaComments size={15} aria-hidden />,
    },
    {
      id: "notes",
      label: labels.tabs.notes,
      icon: <FiClipboard size={15} aria-hidden />,
    },
    {
      id: "documents",
      label: labels.tabs.documents,
      icon: <IoDocuments size={15} aria-hidden />,
    },
    {
      id: "history",
      label: labels.tabs.history,
      icon: <MdOutlineHistory size={15} aria-hidden />,
    },
  ];

  const defaultTab = initialTab ?? tabs[0].id;

  const panels = [
    {
      id: "overview",
      content: (
        <TaskDetailsOverviewTab
          task={task}
          onToggleStep={
            !readOnly && canToggleSteps ? handleToggleStep : undefined
          }
          stepsReadOnly={readOnly || !canToggleSteps}
          onStatusChange={(status) => {
            if (status === "completed") {
              setCompleteOpen(true);
              return;
            }
            updateTaskStatus(task.id, status, {
              author: authorName,
              authorInitials,
            });
          }}
          onPriorityChange={(priority) => {
            updateTaskPriority(task.id, priority);
          }}
          isTracking={isTracking}
          sessionTimer={sessionTimer}
          onToggleTracking={() =>
            toggleTracking(task.id, {
              author: authorName,
              authorInitials,
            })
          }
          onEditTask={() => setEditOpen(true)}
          onCompleteTask={() => setCompleteOpen(true)}
        />
      ),
    },
    {
      id: "metrics",
      content: (
        <TaskDetailsMetricsTab
          task={task}
          budgetTransactions={budgetTransactions}
          liveTimeSpent={liveTimeSpent}
          isTracking={isTracking}
        />
      ),
    },
    {
      id: "time",
      content: (
        <TaskDetailsTimeTab
          entries={taskTimeEntries}
          onSubmitManualTime={
            readOnly
              ? undefined
              : (input) =>
                  addManualTime({
                    taskId: task.id,
                    hours: input.hours,
                    minutes: input.minutes,
                    note: input.note,
                    author: authorName,
                    authorInitials,
                  })
          }
        />
      ),
    },
    {
      id: "transactions",
      content: (
        <TaskDetailsTransactionsTab
          transactions={budgetTransactions}
          onSubmitBudgetExpense={
            readOnly
              ? undefined
              : (input) =>
                  addBudgetExpense({
                    taskId: task.id,
                    amount: input.amount,
                    description: input.description,
                    author: authorName,
                    authorInitials,
                  })
          }
        />
      ),
    },
    {
      id: "comments",
      content: (
        <TaskDetailsCommentsTab
          comments={taskComments}
          onAddComment={readOnly ? undefined : handleAddComment}
        />
      ),
    },
    {
      id: "notes",
      content: (
        <TaskDetailsNotesTab
          notes={taskNotes}
          onAddNote={
            readOnly
              ? undefined
              : (body) =>
                  addTaskNote({
                    taskId: task.id,
                    body,
                    author: authorName,
                    authorInitials,
                  })
          }
        />
      ),
    },
    {
      id: "documents",
      content: (
        <TaskDetailsTabPlaceholder
          icon={<FiFileText size={22} aria-hidden />}
          title={detailLabels.tabs.documents}
          message={detailLabels.tabs.documentsEmpty}
        />
      ),
    },
    {
      id: "history",
      content: <TaskDetailsHistoryTab entries={taskHistory} />,
    },
  ];

  return (
    <>
      <Tabulator
        key={`${task.id}-${defaultTab}`}
        defaultValue={defaultTab}
      >
        <Tabulator.Tabs>
          {tabs.map((tab) => (
            <Tabulator.Tab key={tab.id} value={tab.id}>
              {tab.icon}
              {tab.label}
            </Tabulator.Tab>
          ))}
        </Tabulator.Tabs>

        <Tabulator.Panels>
          {panels.map((panel) => (
            <Tabulator.Panel value={panel.id}>{panel.content}</Tabulator.Panel>
          ))}
        </Tabulator.Panels>
      </Tabulator>

      <TaskCreationDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        onSubmit={(input) => updateTask(task.id, input)}
        initiatorName={initiatorName}
        groupOptions={groupSelectOptions}
        userOptions={userSelectOptions}
        labels={{
          title: detailLabels.editTask,
          subtitle: dashboardLabels.createTaskSubtitle,
          taskTitle: dashboardLabels.taskTitle,
          taskTitlePlaceholder: dashboardLabels.taskTitle,
          required: dashboardLabels.required,
          description: dashboardLabels.taskDescription,
          descriptionPlaceholder: dashboardLabels.taskDescriptionPlaceholder,
          steps: dashboardLabels.stepsToPerform,
          addStep: dashboardLabels.addStep,
          stepPlaceholder: dashboardLabels.stepPlaceholder,
          removeStep: dashboardLabels.removeStep,
          initiator: taskLabels.initiator,
          groups: taskLabels.groups,
          observables: taskLabels.observables,
          startDate: taskLabels.startDate,
          dueDate: taskLabels.dueDate,
          priority: taskLabels.priority,
          priorityPlaceholder: dashboardLabels.priorityPlaceholder,
          budget: dashboardLabels.maxBudget,
          budgetPlaceholder: dashboardLabels.maxBudgetPlaceholder,
          attachments: dashboardLabels.attachments,
          attachFile: detailLabels.attachFile,
          removeAttachment: detailLabels.removeAttachment,
          fileTooLarge: detailLabels.fileTooLarge,
          maxAttachments: detailLabels.maxAttachments,
          requiresResultReview: dashboardLabels.requiresResultReview,
          create: dashboardLabels.create,
          save: detailLabels.saveChanges,
          cancel: t.common.cancel,
          searchOptions: taskLabels.searchOptions,
          noOptionsFound: taskLabels.noOptionsFound,
          selectPlaceholder: taskLabels.selectPlaceholder,
          sectionTaskDetails: dashboardLabels.sections.taskDetails,
          sectionPeople: dashboardLabels.sections.people,
          sectionSchedule: dashboardLabels.sections.schedule,
          sectionPriorityBudget: dashboardLabels.sections.priorityBudget,
          sectionAttachments: dashboardLabels.sections.attachments,
          high: taskLabels.high,
          medium: taskLabels.medium,
          low: taskLabels.low,
        }}
      />

      <CompleteTaskDrawer
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onSubmit={handleCompleteTask}
        labels={{
          title: detailLabels.completeDialogTitle,
          subtitle: detailLabels.completeDialogSubtitle,
          description: detailLabels.completionDescription,
          descriptionPlaceholder: detailLabels.completionDescriptionPlaceholder,
          required: dashboardLabels.required,
          steps: detailLabels.completionSteps,
          addStep: dashboardLabels.addStep,
          stepPlaceholder: dashboardLabels.stepPlaceholder,
          removeStep: dashboardLabels.removeStep,
          apply: detailLabels.completeApply,
          cancel: t.common.cancel,
        }}
      />

    </>
  );
}
