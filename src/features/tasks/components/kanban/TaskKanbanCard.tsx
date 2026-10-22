import {
  FiCalendar,
  FiFlag,
  FiGitBranch,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";

import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import type { Task } from "../../domain/others.ts";
import { getTaskPriorityLabel } from "../../domain/priority.ts";
import { Initials } from "../tabs/utils/Initials.ts";
import { TaskRowActionsButton } from "../buttons/task-row-action-button/TaskRowActionsButton.tsx";
import styles from "./TaskKanbanCard.module.scss";

type TaskKanbanCardProps = {
  task: Task;
  dragging?: boolean;
  commentCount: number;
  onOpen: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAddManualTime: (taskId: string) => void;
  onLogBudgetExpense: (taskId: string) => void;
  isTracking: (taskId: string) => boolean;
  onToggleTracking: (taskId: string) => void;
};

function formatKanbanDueDate(dateString: string, language: string) {
  return new Date(dateString).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export function TaskKanbanCard({
  task,
  dragging = false,
  commentCount,
  onOpen,
  onCompleteTask,
  onAddManualTime,
  onLogBudgetExpense,
  isTracking,
  onToggleTracking,
}: TaskKanbanCardProps) {
  const { t, language } = useTranslation();
  const priorityId = task.priority.id;
  const priorityLabel = getTaskPriorityLabel(priorityId, {
    high: t.tasks.high,
    medium: t.tasks.medium,
    low: t.tasks.low,
  });
  const priorityClass =
    priorityId === "high"
      ? styles.priorityHigh
      : priorityId === "medium"
        ? styles.priorityMedium
        : styles.priorityLow;

  const primaryAssignee = task.responsible[0] ?? null;
  const hiddenAssignees = Math.max(0, task.responsible.length - 1);
  const stepCount = task.steps?.length ?? 0;

  return (
    <article
      className={`${styles.card} ${dragging ? styles.dragging : ""}`.trim()}
    >
      <header className={styles.header}>
        <button
          type="button"
          className={styles.titleBtn}
          onClick={() => onOpen(task.id)}
        >
          <span className={styles.titleText} title={task.title}>
            {task.title}
          </span>
        </button>
        <div className={styles.menu} onMouseDown={(event) => event.stopPropagation()}>
          <TaskRowActionsButton
            task={task}
            isTracking={isTracking(task.id)}
            labels={{
              actions: t.tasks.actions,
              startTracking: t.tasks.startTracking,
              stopTracking: t.tasks.stopTracking,
              completeTask: t.tasks.completeTask,
              addManualTime: t.tasks.addManualTime,
              logBudgetExpense: t.tasks.logBudgetExpense,
            }}
            onToggleTracking={onToggleTracking}
            onComplete={onCompleteTask}
            onAddManualTime={onAddManualTime}
            onLogBudgetExpense={onLogBudgetExpense}
          />
        </div>
      </header>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <FiFlag size={14} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowLabel}>{t.tasks.priority}</span>
            <span className={`${styles.rowValue} ${priorityClass}`}>
              <FiFlag size={13} aria-hidden />
              {priorityLabel}
            </span>
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <FiUser size={14} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowLabel}>{t.tasks.responsible}</span>
            {primaryAssignee ? (
              <span className={styles.assignee}>
                <FeedItem.Avatar className={styles.avatar}>
                  {new Initials(primaryAssignee).get()}
                </FeedItem.Avatar>
                <span className={styles.assigneeName} title={primaryAssignee}>
                  {primaryAssignee}
                </span>
                {hiddenAssignees > 0 ? (
                  <span className={styles.overflow}>+{hiddenAssignees}</span>
                ) : null}
              </span>
            ) : (
              <span className={`${styles.rowValue} ${styles.emptyValue}`}>—</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <FiCalendar size={14} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowLabel}>{t.tasks.dueDate}</span>
            <span className={styles.rowValue}>
              {formatKanbanDueDate(task.dueDate, language)}
            </span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerItem}>
          <FiGitBranch size={13} aria-hidden />
          {stepCount} {t.tasks.kanban.subtasks}
        </span>
        <span className={styles.footerItem}>
          <FiMessageSquare size={13} aria-hidden />
          {commentCount} {t.tasks.kanban.comments}
        </span>
      </footer>
    </article>
  );
}
