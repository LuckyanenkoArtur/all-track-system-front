import type {
  Task,
  TaskFilters,
  TaskSort,
  TaskListQuery,
  SortField,
  TaskPriorityId,
} from "../domain/others";
import { getProjectName } from "../data/mockProjects";
import { normalizeTaskStatus } from "./taskStatusUtils";

const STATUS_ORDER: Record<
  import("../domain/status").TaskStatusId,
  number
> = {
  open: 0,
  onHold: 1,
  inProgress: 2,
  completed: 3,
  cancelled: 4,
};
const PRIORITY_ORDER: Record<TaskPriorityId, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function parseBudget(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

export function formatBudget(value: number | string): string {
  const amount = typeof value === "number" ? value : parseBudget(value);
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function parseTimeMinutes(value: string): number {
  const hours = value.match(/(\d+)h/)?.[1];
  const minutes = value.match(/(\d+)m/)?.[1];
  return (hours ? Number(hours) : 0) * 60 + (minutes ? Number(minutes) : 0);
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function includesAny(values: string[], selected: string[]) {
  if (selected.length === 0) return true;
  return values.some((value) => selected.includes(value));
}

export function matchesSearch(task: Task, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    task.id,
    task.title,
    task.initiator,
    task.budget,
    task.timeSpent,
    task.status,
    task.priority.id,
    task.priority.name,
    getProjectName(task.project) ?? "",
    ...task.groups,
    ...task.responsible,
    ...task.observables,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function matchesFilters(task: Task, filters: TaskFilters): boolean {
  if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
    return false;
  }

  if (
    filters.priorities.length > 0 &&
    !filters.priorities.some(
      (priority) => priority.id === task.priority.id,
    )
  ) {
    return false;
  }

  if (!includesAny(task.groups, filters.groups)) return false;
  const projectFilters = filters.projects ?? [];
  if (
    projectFilters.length > 0 &&
    (!task.project || !projectFilters.includes(task.project))
  ) {
    return false;
  }
  if (
    filters.initiators.length > 0 &&
    !filters.initiators.includes(task.initiator)
  ) {
    return false;
  }
  if (!includesAny(task.responsible, filters.responsible)) return false;
  if (!includesAny(task.observables, filters.observables)) return false;

  if (filters.dueDateFrom) {
    const from = new Date(filters.dueDateFrom).getTime();
    if (new Date(task.dueDate).getTime() < from) return false;
  }

  if (filters.dueDateTo) {
    const to = new Date(filters.dueDateTo).getTime();
    if (new Date(task.dueDate).getTime() > to) return false;
  }

  const budget = parseBudget(task.budget);
  if (filters.budgetMin && budget < Number(filters.budgetMin)) return false;
  if (filters.budgetMax && budget > Number(filters.budgetMax)) return false;

  const timeMinutes = parseTimeMinutes(task.timeSpent);
  if (filters.timeMin && timeMinutes < Number(filters.timeMin)) return false;
  if (filters.timeMax && timeMinutes > Number(filters.timeMax)) return false;

  return true;
}

function compareField(a: Task, b: Task, field: SortField): number {
  switch (field) {
    case "title":
      return a.title.localeCompare(b.title);
    case "status":
      return (
        STATUS_ORDER[normalizeTaskStatus(a.status)] -
        STATUS_ORDER[normalizeTaskStatus(b.status)]
      );
    case "priority":
      return PRIORITY_ORDER[a.priority.id] - PRIORITY_ORDER[b.priority.id];
    case "groups":
      return a.groups.join(", ").localeCompare(b.groups.join(", "));
    case "project":
      return (a.project ?? "").localeCompare(b.project ?? "");
    case "createdAt":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    case "dueDate":
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    case "initiator":
      return a.initiator.localeCompare(b.initiator);
    case "responsible":
      return a.responsible.join(", ").localeCompare(b.responsible.join(", "));
    case "observables":
      return a.observables.join(", ").localeCompare(b.observables.join(", "));
    case "budget":
      return parseBudget(a.budget) - parseBudget(b.budget);
    case "timeSpent":
      return parseTimeMinutes(a.timeSpent) - parseTimeMinutes(b.timeSpent);
    default:
      return 0;
  }
}

export function sortTasks(tasks: Task[], sort: TaskSort | null): Task[] {
  if (!sort) return tasks;

  return [...tasks].sort((a, b) => {
    const result = compareField(a, b, sort.field);
    return sort.direction === "asc" ? result : -result;
  });
}

export function processTaskList(tasks: Task[], query: TaskListQuery) {
  const filtered = tasks.filter(
    (task) =>
      matchesSearch(task, query.filters.search) &&
      matchesFilters(task, query.filters),
  );

  const sorted = sortTasks(filtered, query.sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.pageSize;
  const endIndex = Math.min(startIndex + query.pageSize, total);

  return {
    tasks: sorted.slice(startIndex, endIndex),
    total,
    totalPages,
    page,
    startIndex,
    endIndex,
  };
}

export function getUniqueFilterOptions(tasks: Task[]) {
  const groups = new Set<string>();
  const initiators = new Set<string>();
  const responsible = new Set<string>();
  const observables = new Set<string>();

  for (const task of tasks) {
    task.groups.forEach((group) => groups.add(group));
    initiators.add(task.initiator);
    task.responsible.forEach((person) => responsible.add(person));
    task.observables.forEach((person) => observables.add(person));
  }

  return {
    groups: [...groups].sort(),
    initiators: [...initiators].sort(),
    responsible: [...responsible].sort(),
    observables: [...observables].sort(),
  };
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function areFiltersEqual(a: TaskFilters, b: TaskFilters): boolean {
  return (
    a.search === b.search &&
    arraysEqual(a.statuses, b.statuses) &&
    arraysEqual(
      a.priorities.map((priority) => priority.id),
      b.priorities.map((priority) => priority.id),
    ) &&
    arraysEqual(a.groups, b.groups) &&
    arraysEqual(a.projects ?? [], b.projects ?? []) &&
    arraysEqual(a.initiators, b.initiators) &&
    arraysEqual(a.responsible, b.responsible) &&
    arraysEqual(a.observables, b.observables) &&
    a.dueDateFrom === b.dueDateFrom &&
    a.dueDateTo === b.dueDateTo &&
    a.budgetMin === b.budgetMin &&
    a.budgetMax === b.budgetMax &&
    a.budgetCurrency === b.budgetCurrency &&
    a.timeMin === b.timeMin &&
    a.timeMax === b.timeMax
  );
}

export function areDrawerFiltersEqual(a: TaskFilters, b: TaskFilters): boolean {
  return areFiltersEqual({ ...a, search: "" }, { ...b, search: "" });
}

export function hasDrawerFilters(filters: TaskFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.groups.length > 0 ||
    (filters.projects ?? []).length > 0 ||
    filters.initiators.length > 0 ||
    filters.responsible.length > 0 ||
    filters.observables.length > 0 ||
    filters.dueDateFrom !== "" ||
    filters.dueDateTo !== "" ||
    filters.budgetMin !== "" ||
    filters.budgetMax !== "" ||
    filters.timeMin !== "" ||
    filters.timeMax !== ""
  );
}

export function countDrawerFilters(filters: TaskFilters): number {
  let count = 0;
  if (filters.statuses.length) count += 1;
  if (filters.priorities.length) count += 1;
  if (filters.groups.length) count += 1;
  if ((filters.projects ?? []).length) count += 1;
  if (filters.initiators.length) count += 1;
  if (filters.responsible.length) count += 1;
  if (filters.observables.length) count += 1;
  if (filters.dueDateFrom || filters.dueDateTo) count += 1;
  if (filters.budgetMin || filters.budgetMax) count += 1;
  if (filters.timeMin || filters.timeMax) count += 1;
  return count;
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.groups.length > 0 ||
    (filters.projects ?? []).length > 0 ||
    filters.initiators.length > 0 ||
    filters.responsible.length > 0 ||
    filters.observables.length > 0 ||
    filters.dueDateFrom !== "" ||
    filters.dueDateTo !== "" ||
    filters.budgetMin !== "" ||
    filters.budgetMax !== "" ||
    filters.timeMin !== "" ||
    filters.timeMax !== ""
  );
}

export function countActiveFilters(filters: TaskFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.statuses.length) count += 1;
  if (filters.priorities.length) count += 1;
  if (filters.groups.length) count += 1;
  if ((filters.projects ?? []).length) count += 1;
  if (filters.initiators.length) count += 1;
  if (filters.responsible.length) count += 1;
  if (filters.observables.length) count += 1;
  if (filters.dueDateFrom || filters.dueDateTo) count += 1;
  if (filters.budgetMin || filters.budgetMax) count += 1;
  if (filters.timeMin || filters.timeMax) count += 1;
  return count;
}
