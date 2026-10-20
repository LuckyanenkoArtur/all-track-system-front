import { useMemo, type ReactNode } from "react";
import { FiCalendar, FiClock, FiFolder, FiUser, FiUsers } from "react-icons/fi";
import type { DataTableColumnProps } from "@table/data-table/index.ts";
import columnStyles from "@table/data-table/column/DataColumn.module.scss";
import PriorityBadge from "../../badges/priority-badge/PriorityBadge.tsx";
import StatusBadge from "../../badges/status-badge/StatusBadge.tsx";
import { TaskRowActionsButton } from "../../buttons/task-row-action-button/TaskRowActionsButton.tsx";
import type { Task } from "../../../domain/others.ts";
import { getProjectName } from "../../../data/mockProjects.ts";
import { formatBudget, formatDate } from "../../../utils/taskListUtils.ts";
import styles from "./TaskDataTable.module.scss";

const VISIBLE_PEOPLE_LIMIT = 3;

type UserBadgeListProps = {
  items: string[];
  icon: typeof FiUser;
  emptyLabel?: string;
};

function UserBadgeList({ items, icon: Icon, emptyLabel }: UserBadgeListProps) {
  if (items.length === 0) {
    return emptyLabel ? (
      <span className={styles.emptyCell}>{emptyLabel}</span>
    ) : null;
  }

  const visible = items.slice(0, VISIBLE_PEOPLE_LIMIT);
  const hidden = items.slice(VISIBLE_PEOPLE_LIMIT);

  return (
    <div className={styles.badgeGroup}>
      {visible.map((person) => (
        <span key={person} className={styles.userBadge}>
          <Icon size={12} aria-hidden />
          {person}
        </span>
      ))}
      {hidden.length > 0 && (
        <span
          className={styles.moreBadge}
          title={hidden.join(", ")}
          aria-label={hidden.join(", ")}
        >
          +{hidden.length}
        </span>
      )}
    </div>
  );
}

export type TaskDataTableLabels = {
  allTasks: string;
  noResults: string;
  taskDetails: string;
  status: string;
  priority: string;
  groups: string;
  project: string;
  createdAt: string;
  dueDate: string;
  initiator: string;
  responsible: string;
  observables: string;
  budget: string;
  totalTime: string;
  actions: string;
  startTracking: string;
  stopTracking: string;
  finishTracking: string;
  completeTask: string;
  addManualTime: string;
  logBudgetExpense: string;
  showing: string;
  rowsPerPage: string;
  page: string;
  of: string;
  previous: string;
  next: string;
};

export type TaskColumnDef = {
  id: string;
  hideable?: boolean;
} & Omit<DataTableColumnProps, "body"> & {
    body?: (task: Task) => ReactNode;
  };

type UseTaskDataTableColumnsParams = {
  labels: TaskDataTableLabels;
  isTracking: (taskId: string) => boolean;
  getDisplayTimeSpent: (task: Task) => string;
  onToggleTracking: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAddManualTime: (taskId: string) => void;
  onLogBudgetExpense: (taskId: string) => void;
};

export function useTaskDataTableColumns({
  labels,
  isTracking,
  getDisplayTimeSpent,
  onToggleTracking,
  onCompleteTask,
  onAddManualTime,
  onLogBudgetExpense,
}: UseTaskDataTableColumnsParams): TaskColumnDef[] {
  return useMemo(
    () => [
      {
        id: "title",
        field: "title",
        header: labels.taskDetails,
        hideable: false,
        className: styles.colTitle,
        body: (task) => <div className={styles.taskPrimary}>{task.title}</div>,
      },
      {
        id: "status",
        field: "status",
        header: labels.status,
        className: styles.colStatus,
        body: (task) => <StatusBadge status={task.status} />,
      },
      {
        id: "priority",
        field: "priority",
        header: labels.priority,
        className: styles.colPriority,
        body: (task) => <PriorityBadge priority={task.priority} />,
      },
      {
        id: "groups",
        field: "groups",
        header: labels.groups,
        className: styles.colGroups,
        body: (task) => (
          <div className={styles.badgeGroup}>
            {task.groups.map((group) => (
              <span key={group} className={styles.groupTag}>
                {group}
              </span>
            ))}
          </div>
        ),
      },
      {
        id: "project",
        field: "project",
        header: labels.project,
        className: styles.colProject,
        body: (task) => {
          const projectName = getProjectName(task.project);
          if (!projectName) {
            return <span className={styles.emptyCell}>—</span>;
          }

          return (
            <span className={styles.projectBadge}>
              <FiFolder size={12} aria-hidden />
              {projectName}
            </span>
          );
        },
      },
      {
        id: "createdAt",
        field: "createdAt",
        header: labels.createdAt,
        className: styles.colDate,
        body: (task) => (
          <div className={styles.createdDate}>
            <FiClock size={12} aria-hidden />
            {formatDate(task.createdAt)}
          </div>
        ),
      },
      {
        id: "dueDate",
        field: "dueDate",
        header: labels.dueDate,
        className: styles.colDate,
        body: (task) => (
          <div className={styles.dueDate}>
            <FiCalendar size={12} aria-hidden />
            {formatDate(task.dueDate)}
          </div>
        ),
      },
      {
        id: "initiator",
        field: "initiator",
        header: labels.initiator,
        className: styles.colInitiator,
        body: (task) => (
          <div className={styles.initiator}>
            <FiUser size={14} aria-hidden />
            {task.initiator}
          </div>
        ),
      },
      {
        id: "responsible",
        field: "responsible",
        header: labels.responsible,
        className: styles.colPeople,
        body: (task) => (
          <UserBadgeList items={task.responsible} icon={FiUsers} />
        ),
      },
      {
        id: "observables",
        field: "observables",
        header: labels.observables,
        className: styles.colPeople,
        body: (task) => (
          <UserBadgeList
            items={task.observables}
            icon={FiUser}
            emptyLabel="—"
          />
        ),
      },
      {
        id: "budget",
        field: "budget",
        header: labels.budget,
        align: "right",
        className: styles.colMetric,
        body: (task) => <strong>{formatBudget(task.budget)}</strong>,
      },
      {
        id: "timeSpent",
        field: "timeSpent",
        header: labels.totalTime,
        align: "right",
        className: styles.colMetric,
        body: (task) => {
          const tracking = isTracking(task.id);
          const timeSpent = getDisplayTimeSpent(task);

          return (
            <span
              className={`${styles.timePill} ${tracking ? styles.timePillActive : ""}`}
            >
              {timeSpent}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: labels.actions,
        align: "right",
        sortable: false,
        hideable: false,
        className: columnStyles.actionsCol,
        body: (task) => {
          const tracking = isTracking(task.id);

          return (
            <TaskRowActionsButton
              task={task}
              isTracking={tracking}
              labels={{
                actions: labels.actions,
                startTracking: labels.startTracking,
                stopTracking: labels.stopTracking,
                completeTask: labels.completeTask,
                addManualTime: labels.addManualTime,
                logBudgetExpense: labels.logBudgetExpense,
              }}
              onToggleTracking={onToggleTracking}
              onComplete={onCompleteTask}
              onAddManualTime={onAddManualTime}
              onLogBudgetExpense={onLogBudgetExpense}
            />
          );
        },
      },
    ],
    [
      labels,
      isTracking,
      getDisplayTimeSpent,
      onToggleTracking,
      onCompleteTask,
      onAddManualTime,
      onLogBudgetExpense,
    ],
  );
}
