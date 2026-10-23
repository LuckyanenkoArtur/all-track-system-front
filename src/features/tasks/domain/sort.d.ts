export type SortField =
  | "title"
  | "status"
  | "priority"
  | "category"
  | "project"
  | "createdAt"
  | "dueDate"
  | "initiator"
  | "responsible"
  | "observables"
  | "budget"
  | "timeSpent";

export type SortDirection = "asc" | "desc";

export interface TaskSort {
  field: SortField;
  direction: SortDirection;
}
