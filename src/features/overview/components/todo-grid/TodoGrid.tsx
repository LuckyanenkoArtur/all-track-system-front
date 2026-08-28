import { useTranslation } from "../../../../i18n";
import { TodoScheduleTable } from "../todo-schedule-table/TodoScheduleTable";
import { useTodoScheduleTasks } from "../../hooks/useTodoScheduleTasks";
import styles from "./TodoGrid.module.scss";

type TodoGridProps = {
  onTaskClick: (taskId: string) => void;
};

export function TodoGrid({ onTaskClick }: TodoGridProps) {
  const { t } = useTranslation();
  const { todayTasks, weekTasks } = useTodoScheduleTasks();

  const labels = t.tasks.dashboard;

  const todoTableColumns = {
    name: labels.name,
    projects: labels.projects,
    dueDate: labels.dueDate,
  };

  return (
    <div className={styles.todoGrid}>
      <TodoScheduleTable
        title={labels.todoToday}
        tasks={todayTasks}
        emptyLabel={labels.emptyToday}
        columns={todoTableColumns}
        onTaskClick={(task) => onTaskClick(task.id)}
      />

      <TodoScheduleTable
        title={labels.todoThisWeek}
        tasks={weekTasks}
        emptyLabel={labels.emptyWeek}
        columns={todoTableColumns}
        onTaskClick={(task) => onTaskClick(task.id)}
      />
    </div>
  );
}
