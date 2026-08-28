import { FiCalendar, FiFlag } from "react-icons/fi";
import type { Task, TaskPriorityId } from "../../../tasks/domain/others";
import { formatDueDateShort } from "../../../tasks/utils/dateUtils";
import styles from "./TodoScheduleTable.module.scss";

type TodoScheduleTableProps = {
  title: string;
  tasks: Task[];
  emptyLabel: string;
  columns: {
    name: string;
    projects: string;
    dueDate: string;
  };
  onTaskClick?: (task: Task) => void;
};

const PRIORITY_CLASS: Record<TaskPriorityId, string> = {
  high: styles.priorityHigh,
  medium: styles.priorityMedium,
  low: styles.priorityLow,
};

export function TodoScheduleTable({
  title,
  tasks,
  emptyLabel,
  columns,
  onTaskClick,
}: TodoScheduleTableProps) {
  return (
    <section className={styles.widget}>
      <header className={styles.header}>
        <h2>{title}</h2>
        <span className={styles.count}>{tasks.length}</span>
      </header>

      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th className={styles.iconCol} aria-hidden />
              <th>{columns.name}</th>
              <th>{columns.projects}</th>
              <th>{columns.dueDate}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className={onTaskClick ? styles.clickableRow : undefined}
                  onClick={() => onTaskClick?.(task)}
                >
                  <td className={styles.iconCol}>
                    <FiFlag
                      className={`${styles.flag} ${PRIORITY_CLASS[task.priority.id]}`}
                      aria-hidden
                    />
                  </td>
                  <td>
                    <span className={styles.taskName}>{task.title}</span>
                  </td>
                  <td>
                    <div className={styles.groupList}>
                      {task.groups.map((group) => (
                        <span key={group} className={styles.groupTag}>
                          {group}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={styles.dueDate}>
                      <FiCalendar size={12} aria-hidden />
                      {formatDueDateShort(task.dueDate)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
