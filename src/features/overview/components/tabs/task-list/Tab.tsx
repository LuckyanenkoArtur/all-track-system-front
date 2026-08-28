import { useNavigate } from "react-router-dom";
import { useTasks } from "../../../../tasks/hooks/useTasks.ts";
import { useCallback, useMemo } from "react";
import { getOverviewCardNavigation } from "../../../../tasks/utils/tasksNavigation.ts";
import { TaskInfoCards } from "../../../../tasks/components/cards/task-info-card/TaskInfoCards.tsx";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import { useTodoScheduleTasks } from "../../../hooks/useTodoScheduleTasks";
import { TodoGrid } from "../../todo-grid/TodoGrid.tsx";
import { useTranslation } from "../../../../../i18n/index.ts";

type TaskListTabProps = {
  onTaskClick: (taskId: string) => void;
};

const TaskListTab = ({ onTaskClick }: TaskListTabProps) => {
  //   ---------------------------- PART OF CARDS ----------------------------
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { todayTasks, weekTasks } = useTodoScheduleTasks();

  const { t } = useTranslation();

  const cards_labels = t.tasks.dashboard;

  const stats = useMemo(() => {
    const inProgress = tasks.filter(
      (task) => task.status === "inProgress",
    ).length;
    const open = tasks.filter((task) => task.status === "open").length;
    const completed = tasks.filter(
      (task) => task.status === "completed",
    ).length;

    return {
      total: tasks.length,
      inProgress,
      open,
      completed,
      dueToday: todayTasks.length,
      dueThisWeek: weekTasks.length,
    };
  }, [tasks, todayTasks.length, weekTasks.length]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      const navigation = getOverviewCardNavigation(cardId);
      if (!navigation) return;
      navigate("/app/tasks", { state: navigation });
    },
    [navigate],
  );

  const infoCards = useMemo(
    () => [
      {
        id: "total",
        label: cards_labels.totalTasks,
        value: stats.total,
        icon: <FiLayers size={18} aria-hidden />,
        onClick: () => handleCardClick("total"),
      },
      {
        id: "inProgress",
        label: cards_labels.inProgress,
        value: stats.inProgress,
        tone: "inProgress" as const,
        icon: <FiAlertCircle size={18} aria-hidden />,
        onClick: () => handleCardClick("inProgress"),
      },
      {
        id: "open",
        label: cards_labels.open,
        value: stats.open,
        tone: "open" as const,
        icon: <FiClock size={18} aria-hidden />,
        onClick: () => handleCardClick("open"),
      },
      {
        id: "completed",
        label: cards_labels.completed,
        value: stats.completed,
        tone: "completed" as const,
        icon: <FiCheckCircle size={18} aria-hidden />,
        onClick: () => handleCardClick("completed"),
      },
      {
        id: "dueToday",
        label: cards_labels.dueToday,
        value: stats.dueToday,
        tone: "today" as const,
        icon: <FiCalendar size={18} aria-hidden />,
        onClick: () => handleCardClick("dueToday"),
      },
      {
        id: "dueWeek",
        label: cards_labels.dueThisWeek,
        value: stats.dueThisWeek,
        tone: "week" as const,
        icon: <FiCalendar size={18} aria-hidden />,
        onClick: () => handleCardClick("dueWeek"),
      },
    ],
    [cards_labels, stats, handleCardClick],
  );

  //  --------------------------------- END OF CARDS ---------------------------------
  return (
    <>
      <TaskInfoCards stats={infoCards} />
      <TodoGrid onTaskClick={onTaskClick} />
    </>
  );
};

export default TaskListTab;
