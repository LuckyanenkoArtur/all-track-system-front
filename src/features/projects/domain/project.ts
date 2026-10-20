import type { TaskPriorityId } from "../../tasks/domain/priority.ts";
import type { TaskStatus } from "../../tasks/domain/status.d.ts";

export type ProjectStatus = TaskStatus;
export type ProjectPriority = TaskPriorityId;

export type ProjectMember = {
  id: string;
  initials: string;
};

export type Project = {
  id: string;
  name: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  completedTasks: number;
  totalTasks: number;
  fileCount: number;
  /** Total tracked time in minutes. */
  timeSpentMinutes: number;
  /** Total money spent in major currency units. */
  moneySpent: number;
  members: ProjectMember[];
  dueDate: string;
};

export function formatProjectTimeSpent(
  totalMinutes: number,
  language: string,
): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (language === "ru") {
    return `${hours}ч ${String(minutes).padStart(2, "0")}м`;
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatProjectMoneySpent(
  amount: number,
  language: string,
): string {
  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type ProjectFilters = {
  status: ProjectStatus | null;
  priority: ProjectPriority | null;
};

export const EMPTY_PROJECT_FILTERS: ProjectFilters = {
  status: null,
  priority: null,
};

export function countActiveProjectFilters(filters: ProjectFilters) {
  return Number(filters.status !== null) + Number(filters.priority !== null);
}

export function projectFiltersEqual(a: ProjectFilters, b: ProjectFilters) {
  return a.status === b.status && a.priority === b.priority;
}

export type ProjectSummary = {
  active: number;
  inProgress: number;
  completed: number;
  atRisk: number;
};

export function summarizeProjects(projects: Project[]): ProjectSummary {
  return projects.reduce<ProjectSummary>(
    (summary, project) => {
      if (project.status !== "cancelled") summary.active += 1;
      if (project.status === "inProgress") summary.inProgress += 1;
      if (project.status === "completed") summary.completed += 1;
      if (
        project.priority === "high" &&
        project.status !== "completed" &&
        project.status !== "cancelled"
      ) {
        summary.atRisk += 1;
      }
      return summary;
    },
    { active: 0, inProgress: 0, completed: 0, atRisk: 0 },
  );
}
