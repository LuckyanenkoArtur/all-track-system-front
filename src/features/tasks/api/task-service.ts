import { MOCK_TASKS } from "../data/mockTasks";
import { MOCK_TASK_COMMENTS } from "../data/mockTaskComments";
import type { BudgetTransaction } from "../domain/others";
import type { TaskCollection } from "../domain/collection";
import type { TaskFilters } from "../domain/filters";
import type { TaskSort } from "../domain/sort";
import type { PageSize } from "../domain/others";
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
import { TASK_PRIORITIES, resolveTaskPriority, type TaskPriorityId } from "../domain/priority";
import type { TaskHistoryEntry } from "../domain/history-entry";
import { normalizeTaskStatus } from "../utils/taskStatusUtils";
import { parseTimeMinutes } from "../utils/taskListUtils";
import {
  addElapsedToTimeSpent,
  formatTimeSpent,
} from "../utils/timeTrackingUtils";

const TASKS_STORAGE_KEY = "alltrack-tasks";
const COMMENTS_STORAGE_KEY = "alltrack-task-comments";
const HISTORY_STORAGE_KEY = "alltrack-task-history";
const TRACKING_STORAGE_KEY = "alltrack-task-tracking";
const BUDGET_TRANSACTIONS_STORAGE_KEY = "alltrack-task-budget-transactions";
const COLLECTIONS_STORAGE_KEY = "alltrack-task-collections";

export interface TaskTracking {
  taskId: string;
  startedAt: number;
  author?: string;
  authorInitials?: string;
}

const DEFAULT_COLLECTIONS: TaskCollection[] = [
  {
    id: "high-priority-active",
    name: "High priority · active",
    filters: {
      search: "",
      statuses: ["inProgress"],
      priorities: [TASK_PRIORITIES.high],
      categories: [],
      projects: [],
      initiators: [],
      responsible: [],
      observables: [],
      dueDateFrom: "",
      dueDateTo: "",
      budgetMin: "",
      budgetMax: "",
      budgetCurrency: "USD",
      timeMin: "",
      timeMax: "",
    },
    sort: { field: "dueDate", direction: "asc" },
    pageSize: 10,
  },
  {
    id: "pending-review",
    name: "Open tasks",
    filters: {
      search: "",
      statuses: ["open"],
      priorities: [],
      categories: [],
      projects: [],
      initiators: [],
      responsible: [],
      observables: [],
      dueDateFrom: "",
      dueDateTo: "",
      budgetMin: "",
      budgetMax: "",
      budgetCurrency: "USD",
      timeMin: "",
      timeMax: "",
    },
    sort: { field: "dueDate", direction: "asc" },
    pageSize: 10,
  },
];

function readJson<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextPrefixedId(prefix: string, items: { id: string }[]) {
  const maxId = items.reduce((max, item) => {
    const numeric = Number(item.id.replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);

  return `${prefix}-${String(maxId + 1).padStart(3, "0")}`;
}

function createAttachmentId() {
  return `ATT-${crypto.randomUUID().slice(0, 8)}`;
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolveTaskCategory(task: Task & { groups?: string[] }): string {
  if (typeof task.category === "string" && task.category.trim()) {
    return task.category.trim();
  }
  if (Array.isArray(task.groups)) {
    const fromGroups = task.groups.find(
      (group) => typeof group === "string" && group.trim(),
    );
    if (fromGroups) return fromGroups.trim();
  }
  return "General";
}

function normalizeTask(task: Task): Task {
  const { groups: _legacyGroups, ...rest } = task as Task & {
    groups?: string[];
  };

  return {
    ...rest,
    status: normalizeTaskStatus(task.status),
    priority: resolveTaskPriority(task.priority),
    category: resolveTaskCategory(task as Task & { groups?: string[] }),
    project: task.project ?? null,
    observables: task.observables ?? [],
    startDate: task.startDate ?? task.createdAt,
    steps: task.steps ?? [],
    attachments: task.attachments ?? [],
    requiresResultReview: task.requiresResultReview ?? false,
  };
}

function normalizeFilters(filters: TaskFilters): TaskFilters {
  const legacy = filters as TaskFilters & { groups?: string[] };
  return {
    ...filters,
    categories: filters.categories ?? legacy.groups ?? [],
    projects: filters.projects ?? [],
    observables: filters.observables ?? [],
    priorities: (filters.priorities ?? []).map(resolveTaskPriority),
  };
}

function mapAttachments(attachments: CreateTaskInput["attachments"]) {
  return (attachments ?? []).map((attachment) => ({
    name: attachment.name,
    size: attachment.size,
    mimeType: attachment.mimeType,
    dataUrl: attachment.dataUrl,
    id: attachment.id?.startsWith("ATT-")
      ? attachment.id
      : createAttachmentId(),
  }));
}

function getTrackingMinutes(tracking: TaskTracking, endedAt = Date.now()) {
  return Math.round((endedAt - tracking.startedAt) / 60000);
}

function applyTrackingElapsed(tasks: Task[], tracking: TaskTracking): Task[] {
  const elapsedMs = Date.now() - tracking.startedAt;
  return tasks.map((task) =>
    task.id === tracking.taskId
      ? { ...task, timeSpent: addElapsedToTimeSpent(task.timeSpent, elapsedMs) }
      : task,
  );
}

export class TaskServiceTested {
  private tasks: Task[];
  private comments: TaskComment[];
  private history: TaskHistoryEntry[];
  private budgetTransactions: BudgetTransaction[];
  private tracking: TaskTracking | null;
  private collections: TaskCollection[];

  constructor() {
    this.tasks = this.loadTasks();
    this.comments = this.loadComments();
    this.history = this.loadHistory();
    this.budgetTransactions = this.loadBudgetTransactions();
    this.collections = this.loadCollections();

    const savedTracking = this.loadTracking();
    this.tracking =
      savedTracking && this.tasks.some((task) => task.id === savedTracking.taskId)
        ? savedTracking
        : null;
  }

  getTasks() {
    return this.tasks;
  }

  // getTaskById(id: string) {
  //   return this.tasks.find((task) => task.id === id);
  // }

  getComments() {
    return this.comments;
  }

  getHistory() {
    return this.history;
  }

  getAllBudgetTransactions() {
    return this.budgetTransactions;
  }

  getTracking() {
    return this.tracking;
  }

  getCollections() {
    return this.collections;
  }

  getTaskComments(taskId: string) {
    return this.comments
      .filter((comment) => comment.taskId === taskId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }

  getTaskHistory(taskId: string) {
    return this.history
      .filter((entry) => entry.taskId === taskId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }

  getBudgetTransactions(taskId: string) {
    return this.budgetTransactions
      .filter((entry) => entry.taskId === taskId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  isTracking(taskId: string) {
    return this.tracking?.taskId === taskId;
  }

  getTrackingElapsedMs() {
    if (!this.tracking) return 0;
    return Date.now() - this.tracking.startedAt;
  }

  addTask(input: CreateTaskInput) {
    const now = new Date().toISOString();
    const created: Task = {
      id: nextPrefixedId("TSK", this.tasks),
      title: input.title.trim(),
      status: "open",
      priority: resolveTaskPriority(input.priority),
      category: input.category.trim() || "General",
      project: input.project ?? null,
      observables: input.observables.filter(Boolean),
      createdAt: now,
      startDate: input.startDate ? new Date(input.startDate).toISOString() : now,
      dueDate: new Date(input.dueDate).toISOString(),
      initiator: input.initiator.trim(),
      responsible: input.responsible.filter(Boolean),
      budget: input.budget.trim() || "$0",
      timeSpent: "0h 00m",
      description: input.description?.trim() || undefined,
      steps: input.steps ?? [],
      attachments: mapAttachments(input.attachments),
      requiresResultReview: input.requiresResultReview,
    };

    this.tasks = [created, ...this.tasks];
    this.persistTasks();
    return created;
  }

  updateTask(id: string, input: UpdateTaskInput) {
    const now = new Date().toISOString();
    const author = input.initiator.trim();
    const authorInitials = initialsFromName(author);

    this.tasks = this.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            title: input.title.trim(),
            priority: resolveTaskPriority(input.priority),
            category: input.category.trim() || "General",
            project:
              input.project !== undefined ? input.project : (task.project ?? null),
            observables: input.observables.filter(Boolean),
            startDate: input.startDate
              ? new Date(input.startDate).toISOString()
              : task.startDate,
            dueDate: new Date(input.dueDate).toISOString(),
            initiator: input.initiator.trim(),
            responsible: input.responsible.filter(Boolean),
            budget: input.budget.trim() || "$0",
            description: input.description?.trim() || undefined,
            steps: input.steps ?? task.steps ?? [],
            attachments: input.attachments
              ? mapAttachments(input.attachments)
              : (task.attachments ?? []),
            requiresResultReview: input.requiresResultReview,
          }
        : task,
    );
    this.persistTasks();

    this.appendHistory({
      id: nextPrefixedId("HIS", this.history),
      taskId: id,
      type: "task_updated",
      author,
      authorInitials,
      description: input.description?.trim() || input.title.trim(),
      steps: [],
      createdAt: now,
    });
  }

  updateTaskSteps(id: string, steps: TaskStep[]) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, steps } : task,
    );
    this.persistTasks();
  }

  updateTaskStatus(
    id: string,
    status: TaskStatus,
    changeAuthor?: { author: string; authorInitials: string },
  ) {
    const task = this.tasks.find((item) => item.id === id);
    if (!task || task.status === status) return;

    if (changeAuthor) {
      this.appendHistory({
        id: nextPrefixedId("HIS", this.history),
        taskId: id,
        type: "status_changed",
        author: changeAuthor.author,
        authorInitials: changeAuthor.authorInitials,
        description: "",
        steps: [],
        createdAt: new Date().toISOString(),
        statusFrom: task.status,
        statusTo: status,
      });
    }

    this.tasks = this.tasks.map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    this.persistTasks();
  }

  updateTaskPriority(id: string, priority: TaskPriorityId) {
    const resolved = resolveTaskPriority(priority);
    const task = this.tasks.find((item) => item.id === id);
    if (!task || task.priority.id === resolved.id) return;

    this.tasks = this.tasks.map((item) =>
      item.id === id ? { ...item, priority: resolved } : item,
    );
    this.persistTasks();
  }

  updateTaskProject(id: string, project: string | null) {
    const task = this.tasks.find((item) => item.id === id);
    if (!task || (task.project ?? null) === project) return;

    this.tasks = this.tasks.map((item) =>
      item.id === id ? { ...item, project } : item,
    );
    this.persistTasks();
  }

  startTracking(taskId: string, meta?: TrackingMeta) {
    if (this.tracking?.taskId === taskId) return;

    if (this.tracking) {
      this.commitTrackingSession(this.tracking);
    }

    this.tasks = this.tasks.map((task) => {
      if (task.id !== taskId) return task;
      if (task.status === "open") {
        return { ...task, status: "inProgress" as const };
      }
      return task;
    });
    this.persistTasks();

    this.tracking = {
      taskId,
      startedAt: Date.now(),
      ...(meta && {
        author: meta.author,
        authorInitials: meta.authorInitials,
      }),
    };
    this.persistTracking();
  }

  stopTracking() {
    if (!this.tracking) return;
    this.commitTrackingSession(this.tracking);
    this.tracking = null;
    this.persistTracking();
  }

  toggleTracking(taskId: string, meta?: TrackingMeta) {
    if (this.tracking?.taskId === taskId) {
      this.stopTracking();
      return;
    }
    this.startTracking(taskId, meta);
  }

  completeTask(taskId: string) {
    this.clearTrackingForTask(taskId);
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, status: "completed" as const } : task,
    );
    this.persistTasks();
  }

  completeTaskWithReport(input: CompleteTaskReportInput) {
    const description = input.description.trim();
    const steps = input.steps
      .map((step) => ({ ...step, text: step.text.trim() }))
      .filter((step) => step.text.length > 0);
    const now = new Date().toISOString();

    this.clearTrackingForTask(input.taskId);

    this.tasks = this.tasks.map((task) =>
      task.id === input.taskId
        ? { ...task, status: "completed" as const }
        : task,
    );
    this.persistTasks();

    this.comments = [
      ...this.comments,
      {
        id: nextPrefixedId("CMT", this.comments),
        taskId: input.taskId,
        author: input.author,
        authorInitials: input.authorInitials,
        body: description,
        createdAt: now,
        attachments: [],
        kind: "completion",
        completionSteps: steps.length > 0 ? steps : undefined,
      },
    ];
    this.persistComments();

    this.appendHistory({
      id: nextPrefixedId("HIS", this.history),
      taskId: input.taskId,
      type: "task_completed",
      author: input.author,
      authorInitials: input.authorInitials,
      description,
      steps,
      createdAt: now,
    });
  }

  addManualTime(input: AddManualTimeInput) {
    const totalMinutes =
      Math.max(0, input.hours) * 60 + Math.max(0, input.minutes);
    if (totalMinutes <= 0) return;

    const note = input.note?.trim() ?? "";
    const now = new Date().toISOString();

    this.tasks = this.tasks.map((task) =>
      task.id === input.taskId
        ? {
            ...task,
            timeSpent: formatTimeSpent(
              parseTimeMinutes(task.timeSpent) + totalMinutes,
            ),
          }
        : task,
    );
    this.persistTasks();

    this.appendHistory({
      id: nextPrefixedId("HIS", this.history),
      taskId: input.taskId,
      type: "manual_time_added",
      author: input.author,
      authorInitials: input.authorInitials,
      description: note,
      steps: [],
      createdAt: now,
      minutesAdded: totalMinutes,
    });
  }

  addBudgetExpense(input: AddBudgetExpenseInput) {
    const amount = Math.max(0, input.amount);
    const description = input.description.trim();
    if (amount <= 0 || !description) return;

    const now = new Date().toISOString();

    this.budgetTransactions = [
      ...this.budgetTransactions,
      {
        id: nextPrefixedId("BTX", this.budgetTransactions),
        taskId: input.taskId,
        amount,
        description,
        createdAt: now,
        author: input.author,
      },
    ];
    this.persistBudgetTransactions();

    this.appendHistory({
      id: nextPrefixedId("HIS", this.history),
      taskId: input.taskId,
      type: "budget_expense_added",
      author: input.author,
      authorInitials: input.authorInitials,
      description,
      steps: [],
      createdAt: now,
      amount,
    });
  }

  addTaskComment(input: AddTaskCommentInput) {
    const now = new Date().toISOString();
    const createdComment: TaskComment = {
      id: nextPrefixedId("CMT", this.comments),
      taskId: input.taskId,
      author: input.author,
      authorInitials: input.authorInitials,
      body: input.body,
      createdAt: now,
      attachments: input.attachments.map((attachment) => ({
        ...attachment,
        id: createAttachmentId(),
      })),
      kind: input.kind ?? "default",
      completionSteps: input.completionSteps,
    };

    this.comments = [...this.comments, createdComment];
    this.persistComments();

    if (input.kind !== "completion") {
      this.appendHistory({
        id: nextPrefixedId("HIS", this.history),
        taskId: input.taskId,
        type: "comment_added",
        author: input.author,
        authorInitials: input.authorInitials,
        description: input.body.trim(),
        steps: [],
        createdAt: now,
      });
    }

    return createdComment;
  }

  addTaskNote(input: AddTaskNoteInput) {
    const body = input.body.trim();
    if (!body) {
      throw new Error("Note body is required");
    }

    const now = new Date().toISOString();
    const createdEntry: TaskHistoryEntry = {
      id: nextPrefixedId("HIS", this.history),
      taskId: input.taskId,
      type: "note_added",
      author: input.author,
      authorInitials: input.authorInitials,
      description: body,
      steps: [],
      createdAt: now,
    };

    this.appendHistory(createdEntry);
    return createdEntry;
  }

  saveCollection(
    name: string,
    filters: TaskFilters,
    sort: TaskSort | null,
    pageSize: PageSize,
  ) {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const collection: TaskCollection = {
      id: crypto.randomUUID(),
      name: trimmed,
      filters,
      sort,
      pageSize,
    };

    this.collections = [...this.collections, collection];
    this.persistCollections();
    return collection;
  }

  deleteCollection(id: string) {
    this.collections = this.collections.filter(
      (collection) => collection.id !== id,
    );
    this.persistCollections();
  }

  private clearTrackingForTask(taskId: string) {
    if (this.tracking?.taskId !== taskId) return;
    this.commitTrackingSession(this.tracking);
    this.tracking = null;
    this.persistTracking();
  }

  private commitTrackingSession(session: TaskTracking) {
    const minutesAdded = getTrackingMinutes(session);
    this.tasks = applyTrackingElapsed(this.tasks, session);
    this.persistTasks();

    if (minutesAdded > 0 && session.author) {
      this.appendHistory({
        id: nextPrefixedId("HIS", this.history),
        taskId: session.taskId,
        type: "time_tracked",
        author: session.author,
        authorInitials: session.authorInitials ?? session.author.slice(0, 2),
        description: "",
        steps: [],
        createdAt: new Date().toISOString(),
        minutesAdded,
      });
    }
  }

  private appendHistory(entry: TaskHistoryEntry) {
    this.history = [...this.history, entry];
    this.persistHistory();
  }

  private loadTasks(): Task[] {
    const parsed = readJson<Task[]>(TASKS_STORAGE_KEY);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeTask);
    }
    return MOCK_TASKS.map(normalizeTask);
  }

  private loadComments(): TaskComment[] {
    const parsed = readJson<TaskComment[]>(COMMENTS_STORAGE_KEY);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return MOCK_TASK_COMMENTS;
  }

  private loadHistory(): TaskHistoryEntry[] {
    const parsed = readJson<TaskHistoryEntry[]>(HISTORY_STORAGE_KEY);
    return Array.isArray(parsed) ? parsed : [];
  }

  private loadBudgetTransactions(): BudgetTransaction[] {
    const parsed = readJson<BudgetTransaction[]>(BUDGET_TRANSACTIONS_STORAGE_KEY);
    return Array.isArray(parsed) ? parsed : [];
  }

  private loadTracking(): TaskTracking | null {
    const parsed = readJson<TaskTracking>(TRACKING_STORAGE_KEY);
    if (parsed?.taskId && parsed?.startedAt) {
      return parsed;
    }
    return null;
  }

  private loadCollections(): TaskCollection[] {
    const parsed = readJson<TaskCollection[]>(COLLECTIONS_STORAGE_KEY);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((collection) => ({
        ...collection,
        filters: normalizeFilters(collection.filters),
      }));
    }
    return DEFAULT_COLLECTIONS;
  }

  private persistTasks() {
    writeJson(TASKS_STORAGE_KEY, this.tasks);
  }

  private persistComments() {
    writeJson(COMMENTS_STORAGE_KEY, this.comments);
  }

  private persistHistory() {
    writeJson(HISTORY_STORAGE_KEY, this.history);
  }

  private persistBudgetTransactions() {
    writeJson(BUDGET_TRANSACTIONS_STORAGE_KEY, this.budgetTransactions);
  }

  private persistTracking() {
    if (this.tracking) {
      writeJson(TRACKING_STORAGE_KEY, this.tracking);
    } else {
      localStorage.removeItem(TRACKING_STORAGE_KEY);
    }
  }

  private persistCollections() {
    writeJson(COLLECTIONS_STORAGE_KEY, this.collections);
  }
}

export const taskService = new TaskServiceTested();

export default TaskServiceTested;


// UPDATE VERSION OF TASK SERVICE TO USE THE NEW API
interface TaskServiceContract {
  getTasks(): Task[];
  getTaskById(id: string): Promise<Task | null>;
}

class TaskService implements TaskServiceContract {
  getTasks(): Task[] {
    return MOCK_TASKS.map(normalizeTask);
  }

  async getTaskById(id: string): Promise<Task | null> {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const found = MOCK_TASKS.find((task) => task.id === id);
    return found ? normalizeTask(found) : null;
  }
}

export const taskServiceNew = new TaskService();

