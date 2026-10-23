import type { TaskPriority } from "./priority";
import type { TaskStatus } from "./status";

export interface TaskFilters {
  search: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  categories: string[];
  projects: string[];
  initiators: string[];
  responsible: string[];
  observables: string[];
  dueDateFrom: string;
  dueDateTo: string;
  budgetMin: string;
  budgetMax: string;
  budgetCurrency: string;
  timeMin: string;
  timeMax: string;
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  statuses: [],
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
};
