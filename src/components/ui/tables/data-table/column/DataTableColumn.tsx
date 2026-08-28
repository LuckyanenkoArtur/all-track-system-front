import type { ReactNode } from "react";

import { DATA_TABLE_SLOT } from "../slots";

export type DataTableColumnProps = {
  field?: string;
  header: string;
  body?: (row: unknown) => ReactNode;
  align?: "left" | "right";
  sortable?: boolean;
  className?: string;
};

export type ColumnSort = {
  field: string;
  direction: "asc" | "desc";
} | null;

export const DataTableColumn = Object.assign(
  (() => null) as (props: DataTableColumnProps) => null,
  {
    slot: DATA_TABLE_SLOT.Column,
    displayName: DATA_TABLE_SLOT.Column,
  },
);
