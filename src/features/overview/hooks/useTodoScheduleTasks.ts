import { useMemo } from "react";
import { useTasks } from "../../tasks/hooks/useTasks";
import { isThisWeek, isToday } from "../../tasks/utils/dateUtils";

import { isSchedulableTaskStatus } from "../../tasks/utils/taskStatusUtils";
import type { TaskStatus } from "../../tasks/domain/status";

function isOpenTask(status: TaskStatus) {
  return isSchedulableTaskStatus(status);
}

export function useTodoScheduleTasks() {
  const { tasks } = useTasks();

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => isOpenTask(task.status) && isToday(task.dueDate))
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        ),
    [tasks],
  );

  const weekTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            isOpenTask(task.status) &&
            isThisWeek(task.dueDate) &&
            !isToday(task.dueDate),
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        ),
    [tasks],
  );

  return { todayTasks, weekTasks };
}
