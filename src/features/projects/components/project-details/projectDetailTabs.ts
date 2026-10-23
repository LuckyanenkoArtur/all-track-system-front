export const PROJECT_DETAIL_TABS = [
  "overview",
  "tasks",
  "transactions",
  "documents",
  "activities",
] as const;

export type ProjectDetailTab =
  | (typeof PROJECT_DETAIL_TABS)[number]
  | "members";
