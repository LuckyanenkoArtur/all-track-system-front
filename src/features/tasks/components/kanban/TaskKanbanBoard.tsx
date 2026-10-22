import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPlayCircle,
} from "react-icons/fi";

import { useTranslation } from "../../../../i18n/index.ts";
import type { Task, TaskStatus } from "../../domain/others.ts";
import { isTerminalTaskStatus } from "../../utils/taskStatusUtils.ts";
import { TaskKanbanCard } from "./TaskKanbanCard.tsx";
import styles from "./TaskKanbanBoard.module.scss";

const TASK_DRAG_MIME = "application/x-alltrack-task-id";

export type TaskKanbanColumnId = "todo" | "overdue" | "doing" | "completed";

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

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function isTaskOverdue(task: Task) {
  if (isTerminalTaskStatus(task.status)) return false;
  return new Date(task.dueDate).getTime() < startOfToday();
}

function getKanbanColumn(task: Task): TaskKanbanColumnId | null {
  if (task.status === "cancelled") return null;
  if (task.status === "completed") return "completed";
  if (task.status === "inProgress") return "doing";
  if (isTaskOverdue(task)) return "overdue";
  return "todo";
}

const DROP_STATUS: Partial<Record<TaskKanbanColumnId, TaskStatus>> = {
  todo: "open",
  doing: "inProgress",
  completed: "completed",
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
  const [activeColumn, setActiveColumn] = useState<TaskKanbanColumnId | null>(
    null,
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const buckets: Record<TaskKanbanColumnId, Task[]> = {
      todo: [],
      overdue: [],
      doing: [],
      completed: [],
    };

    for (const task of tasks) {
      const column = getKanbanColumn(task);
      if (column) buckets[column].push(task);
    }

    const defs: {
      id: TaskKanbanColumnId;
      label: string;
      icon: ReactNode;
      headerClass: string;
      acceptsDrop: boolean;
    }[] = [
      {
        id: "todo",
        label: t.tasks.kanban.todo,
        icon: <FiClock size={15} aria-hidden />,
        headerClass: styles.todoHeader,
        acceptsDrop: true,
      },
      {
        id: "overdue",
        label: t.tasks.kanban.overdue,
        icon: <FiAlertTriangle size={15} aria-hidden />,
        headerClass: styles.overdueHeader,
        acceptsDrop: false,
      },
      {
        id: "doing",
        label: t.tasks.kanban.doing,
        icon: <FiPlayCircle size={15} aria-hidden />,
        headerClass: styles.doingHeader,
        acceptsDrop: true,
      },
      {
        id: "completed",
        label: t.tasks.kanban.completed,
        icon: <FiCheckCircle size={15} aria-hidden />,
        headerClass: styles.completedHeader,
        acceptsDrop: true,
      },
    ];

    return defs.map((column) => ({
      ...column,
      tasks: buckets[column.id],
    }));
  }, [tasks, t.tasks.kanban]);

  const handleDragStart = (event: DragEvent, taskId: string) => {
    event.dataTransfer.setData(TASK_DRAG_MIME, taskId);
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setActiveColumn(null);
  };

  const handleDragOver = (
    event: DragEvent,
    columnId: TaskKanbanColumnId,
    acceptsDrop: boolean,
  ) => {
    if (!acceptsDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (activeColumn !== columnId) setActiveColumn(columnId);
  };

  const handleDragLeave = (event: DragEvent, columnId: TaskKanbanColumnId) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    if (activeColumn === columnId) setActiveColumn(null);
  };

  const handleDrop = (
    event: DragEvent,
    columnId: TaskKanbanColumnId,
    acceptsDrop: boolean,
  ) => {
    event.preventDefault();
    if (!acceptsDrop) {
      setDraggingId(null);
      setActiveColumn(null);
      return;
    }

    const taskId =
      event.dataTransfer.getData(TASK_DRAG_MIME) ||
      event.dataTransfer.getData("text/plain");
    const nextStatus = DROP_STATUS[columnId];
    if (taskId && nextStatus) {
      if (nextStatus === "completed") {
        onCompleteTask(taskId);
      } else {
        onStatusChange(taskId, nextStatus);
      }
    }
    setDraggingId(null);
    setActiveColumn(null);
  };

  return (
    <div
      className={styles.board}
      role="list"
      aria-label={t.tasks.kanbanView}
    >
      {columns.map((column) => (
        <section
          key={column.id}
          className={`${styles.column} ${
            activeColumn === column.id ? styles.columnActive : ""
          }`}
          role="list"
          aria-label={column.label}
          onDragOver={(event) =>
            handleDragOver(event, column.id, column.acceptsDrop)
          }
          onDragLeave={(event) => handleDragLeave(event, column.id)}
          onDrop={(event) => handleDrop(event, column.id, column.acceptsDrop)}
        >
          <header className={`${styles.columnHeader} ${column.headerClass}`}>
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIcon}>{column.icon}</span>
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
