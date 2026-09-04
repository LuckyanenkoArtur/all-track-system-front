import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  taskService,
  type TaskTracking,
} from "../api/task-service";
import type { BudgetTransaction } from "../domain/others";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  CompleteTaskReportInput,
  AddManualTimeInput,
  AddBudgetExpenseInput,
  AddTaskCommentInput,
  AddTaskNoteInput,
  TrackingMeta,
} from "../domain/inputs";
import type { Task } from "../domain/task";
import type { TaskStep } from "../domain/step";
import type { TaskStatus } from "../domain/status";
import type { TaskComment } from "../domain/comment";
import type { TaskPriorityId } from "../domain/priority";
import type { TaskHistoryEntry } from "../domain/history-entry";

export type { TaskTracking };

interface TasksContextValue {
  tasks: Task[];
  tracking: TaskTracking | null;
  budgetTransactions: BudgetTransaction[];
  getTaskById: (id: string) => Task | undefined;
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  updateTaskSteps: (id: string, steps: TaskStep[]) => void;
  updateTaskStatus: (
    id: string,
    status: TaskStatus,
    changeAuthor?: { author: string; authorInitials: string },
  ) => void;
  updateTaskPriority: (id: string, priority: TaskPriorityId) => void;
  startTracking: (taskId: string, meta?: TrackingMeta) => void;
  stopTracking: () => void;
  toggleTracking: (taskId: string, meta?: TrackingMeta) => void;
  completeTask: (taskId: string) => void;
  completeTaskWithReport: (input: CompleteTaskReportInput) => void;
  addManualTime: (input: AddManualTimeInput) => void;
  addBudgetExpense: (input: AddBudgetExpenseInput) => void;
  getBudgetTransactions: (taskId: string) => BudgetTransaction[];
  isTracking: (taskId: string) => boolean;
  getTrackingElapsedMs: () => number;
  getTaskComments: (taskId: string) => TaskComment[];
  getTaskHistory: (taskId: string) => TaskHistoryEntry[];
  addTaskComment: (input: AddTaskCommentInput) => TaskComment;
  addTaskNote: (input: AddTaskNoteInput) => TaskHistoryEntry;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export { TasksContext };

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => taskService.getTasks());
  const [tracking, setTracking] = useState<TaskTracking | null>(() =>
    taskService.getTracking(),
  );
  const [budgetTransactions, setBudgetTransactions] = useState<
    BudgetTransaction[]
  >(() => taskService.getAllBudgetTransactions());
  const [tick, setTick] = useState(0);

  const sync = useCallback(() => {
    setTasks(taskService.getTasks());
    setTracking(taskService.getTracking());
    setBudgetTransactions(taskService.getAllBudgetTransactions());
    setTick((value) => value + 1);
  }, []);

  const getTaskById = useCallback(
    (id: string) => taskService.getTaskById(id),
    [tick],
  );

  const addTask = useCallback(
    (input: CreateTaskInput) => {
      const created = taskService.addTask(input);
      sync();
      return created;
    },
    [sync],
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput) => {
      taskService.updateTask(id, input);
      sync();
    },
    [sync],
  );

  const updateTaskSteps = useCallback(
    (id: string, steps: TaskStep[]) => {
      taskService.updateTaskSteps(id, steps);
      sync();
    },
    [sync],
  );

  const updateTaskStatus = useCallback(
    (
      id: string,
      status: TaskStatus,
      changeAuthor?: { author: string; authorInitials: string },
    ) => {
      taskService.updateTaskStatus(id, status, changeAuthor);
      sync();
    },
    [sync],
  );

  const updateTaskPriority = useCallback(
    (id: string, priority: TaskPriorityId) => {
      taskService.updateTaskPriority(id, priority);
      sync();
    },
    [sync],
  );

  const startTracking = useCallback(
    (taskId: string, meta?: TrackingMeta) => {
      taskService.startTracking(taskId, meta);
      sync();
    },
    [sync],
  );

  const stopTracking = useCallback(() => {
    taskService.stopTracking();
    sync();
  }, [sync]);

  const toggleTracking = useCallback(
    (taskId: string, meta?: TrackingMeta) => {
      taskService.toggleTracking(taskId, meta);
      sync();
    },
    [sync],
  );

  const completeTask = useCallback(
    (taskId: string) => {
      taskService.completeTask(taskId);
      sync();
    },
    [sync],
  );

  const completeTaskWithReport = useCallback(
    (input: CompleteTaskReportInput) => {
      taskService.completeTaskWithReport(input);
      sync();
    },
    [sync],
  );

  const addManualTime = useCallback(
    (input: AddManualTimeInput) => {
      taskService.addManualTime(input);
      sync();
    },
    [sync],
  );

  const addBudgetExpense = useCallback(
    (input: AddBudgetExpenseInput) => {
      taskService.addBudgetExpense(input);
      sync();
    },
    [sync],
  );

  const getBudgetTransactions = useCallback(
    (taskId: string) => taskService.getBudgetTransactions(taskId),
    [tick],
  );

  const isTracking = useCallback(
    (taskId: string) => taskService.isTracking(taskId),
    [tick],
  );

  const getTrackingElapsedMs = useCallback(
    () => taskService.getTrackingElapsedMs(),
    [tick],
  );

  const getTaskComments = useCallback(
    (taskId: string) => taskService.getTaskComments(taskId),
    [tick],
  );

  const getTaskHistory = useCallback(
    (taskId: string) => taskService.getTaskHistory(taskId),
    [tick],
  );

  const addTaskComment = useCallback(
    (input: AddTaskCommentInput) => {
      const created = taskService.addTaskComment(input);
      sync();
      return created;
    },
    [sync],
  );

  const addTaskNote = useCallback(
    (input: AddTaskNoteInput) => {
      const created = taskService.addTaskNote(input);
      sync();
      return created;
    },
    [sync],
  );

  const value = useMemo(
    () => ({
      tasks,
      tracking,
      budgetTransactions,
      getTaskById,
      addTask,
      updateTask,
      updateTaskSteps,
      updateTaskStatus,
      updateTaskPriority,
      startTracking,
      stopTracking,
      toggleTracking,
      completeTask,
      completeTaskWithReport,
      addManualTime,
      addBudgetExpense,
      getBudgetTransactions,
      isTracking,
      getTrackingElapsedMs,
      getTaskComments,
      getTaskHistory,
      addTaskComment,
      addTaskNote,
    }),
    [
      tasks,
      tracking,
      budgetTransactions,
      getTaskById,
      addTask,
      updateTask,
      updateTaskSteps,
      updateTaskStatus,
      updateTaskPriority,
      startTracking,
      stopTracking,
      toggleTracking,
      completeTask,
      completeTaskWithReport,
      addManualTime,
      addBudgetExpense,
      getBudgetTransactions,
      isTracking,
      getTrackingElapsedMs,
      getTaskComments,
      getTaskHistory,
      addTaskComment,
      addTaskNote,
    ],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
