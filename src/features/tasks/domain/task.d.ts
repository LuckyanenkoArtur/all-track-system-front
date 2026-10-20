import type { Attachment } from "../../../domain/attachment";
import type { TaskPriority } from "./priority";
import type { TaskStatus } from "./status";
import type { TaskStep } from "./step";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  groups: string[];
  project?: string | null;
  observables: string[];
  createdAt: string;
  startDate: string;
  dueDate: string;
  initiator: string;
  responsible: string[];
  budget: string;
  timeSpent: string;
  description?: string;
  steps?: TaskStep[];
  attachments?: Attachment[];
  requiresResultReview?: boolean;
  budgetSpent?: string;
}
