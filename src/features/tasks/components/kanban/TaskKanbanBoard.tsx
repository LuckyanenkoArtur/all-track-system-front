import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiPauseCircle,
  FiPlayCircle,
  FiXCircle,
} from "react-icons/fi";

import { useTranslation } from "../../../../i18n/index.ts";
import type { Task, TaskStatus } from "../../domain/others.ts";
import { TASK_STATUS_IDS } from "../../utils/taskStatusUtils.ts";
import { TaskKanbanCard } from "./TaskKanbanCard.tsx";
import styles from "./TaskKanbanBoard.module.scss";

const TASK_DRAG_MIME = "application/x-alltrack-task-id";

const COLUMN_CHROME: Record<
  TaskStatus,
  { icon: ReactNode; headerClass: string }
> = {
  open: {
    icon: <FiClock size={15} aria-hidden />,
    headerClass: styles.openHeader,
  },
  onHold: {
    icon: <FiPauseCircle size={15} aria-hidden />,
    headerClass: styles.onHoldHeader,
  },
  inProgress: {
    icon: <FiPlayCircle size={15} aria-hidden />,
    headerClass: styles.inProgressHeader,
  },
  completed: {
    icon: <FiCheckCircle size={15} aria-hidden />,
    headerClass: styles.completedHeader,
  },
  cancelled: {
    icon: <FiXCircle size={15} aria-hidden />,
    headerClass: styles.cancelledHeader,
  },
};

type TaskKanbanBoardProps = {
  tasks: Task[];
  getCommentCount: (taskId: string) => number;
  onTaskClick: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onCompleteTask: (taskId: string) => void;
  onAddManualTime: (taskId: string) => void;
  onLogBudgetExpense: (taskId: string) => void;
  isTracking: (taskId: string) => boolean;
  onToggleTracking: (taskId: string) => void;
};

export function TaskKanbanBoard({
  tasks,
  getCommentCount,
  onTaskClick,
  onStatusChange,
  onCompleteTask,
  onAddManualTime,
  onLogBudgetExpense,
  isTracking,
  onToggleTracking,
}: TaskKanbanBoardProps) {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState<TaskStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const byStatus = Object.fromEntries(
      TASK_STATUS_IDS.map((status) => [status, [] as Task[]]),
    ) as Record<TaskStatus, Task[]>;

    for (const task of tasks) {
      byStatus[task.status]?.push(task);
    }

    return TASK_STATUS_IDS.map((status) => ({
      status,
      label: t.tasks[status],
      tasks: byStatus[status],
    }));
  }, [tasks, t.tasks]);

  const handleDragStart = (event: DragEvent, taskId: string) => {
    event.dataTransfer.setData(TASK_DRAG_MIME, taskId);
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setActiveStatus(null);
  };

  const handleDragOver = (event: DragEvent, status: TaskStatus) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (activeStatus !== status) setActiveStatus(status);
  };

  const handleDragLeave = (event: DragEvent, status: TaskStatus) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    if (activeStatus === status) setActiveStatus(null);
  };

  const handleDrop = (event: DragEvent, status: TaskStatus) => {
    event.preventDefault();
    const taskId =
      event.dataTransfer.getData(TASK_DRAG_MIME) ||
      event.dataTransfer.getData("text/plain");

    if (taskId) {
      if (status === "completed") {
        onCompleteTask(taskId);
      } else {
        onStatusChange(taskId, status);
      }
    }

    setDraggingId(null);
    setActiveStatus(null);
  };

  return (
    <div className={styles.board} role="list" aria-label={t.tasks.kanbanView}>
      {columns.map((column) => (
        <section
          key={column.status}
          className={`${styles.column} ${
            activeStatus === column.status ? styles.columnActive : ""
          }`}
          role="list"
          aria-label={column.label}
          onDragOver={(event) => handleDragOver(event, column.status)}
          onDragLeave={(event) => handleDragLeave(event, column.status)}
          onDrop={(event) => handleDrop(event, column.status)}
        >
          <header
            className={`${styles.columnHeader} ${COLUMN_CHROME[column.status].headerClass}`}
          >
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIcon}>
                {COLUMN_CHROME[column.status].icon}
              </span>
              <h3 className={styles.columnTitle}>{column.label}</h3>
            </div>
            <span className={styles.columnCount}>{column.tasks.length}</span>
          </header>

          <div className={styles.columnBody}>
            {column.tasks.length === 0 ? (
              <p className={styles.columnEmpty}>{t.tasks.kanbanEmpty}</p>
            ) : (
              column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.cardSlot}
                  role="listitem"
                  draggable
                  onDragStart={(event) => handleDragStart(event, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskKanbanCard
                    task={task}
                    dragging={draggingId === task.id}
                    commentCount={getCommentCount(task.id)}
                    onOpen={onTaskClick}
                    onCompleteTask={onCompleteTask}
                    onAddManualTime={onAddManualTime}
                    onLogBudgetExpense={onLogBudgetExpense}
                    isTracking={isTracking}
                    onToggleTracking={onToggleTracking}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
