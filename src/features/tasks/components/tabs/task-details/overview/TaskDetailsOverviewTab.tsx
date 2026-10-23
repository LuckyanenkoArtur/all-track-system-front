import type {
  Task,
  TaskPriorityId,
  TaskStatus,
} from "../../../../domain/others.ts";
import styles from "./TaskDetailsOverviewTab.module.scss";

import { TaskOverviewBody } from "./TaskOverviewBody.tsx";

type TaskDetailsOverviewTabProps = {
  task: Task; //! This should be done using the TaskService for getting the task details
  onToggleStep?: (stepId: string) => void;
  stepsReadOnly?: boolean;
  onStatusChange?: (status: TaskStatus) => void;
  onPriorityChange?: (priority: TaskPriorityId) => void;
  isTracking?: boolean;
  sessionTimer?: string;
  onToggleTracking?: () => void;
  onEditTask?: () => void;
  onCompleteTask?: () => void;
};

export function TaskDetailsOverviewTab({
  task,
  onToggleStep,
  stepsReadOnly = false,
  onStatusChange,
  onPriorityChange,
  isTracking,
  sessionTimer,
  onToggleTracking,
  onEditTask,
  onCompleteTask,
}: TaskDetailsOverviewTabProps) {
  return (
    <div className={styles.overview}>
      <TaskOverviewBody
        task={task}
        onToggleStep={onToggleStep}
        stepsReadOnly={stepsReadOnly}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        isTracking={isTracking}
        sessionTimer={sessionTimer}
        onToggleTracking={onToggleTracking}
        onEditTask={onEditTask}
        onCompleteTask={onCompleteTask}
      />
    </div>
  );
}
