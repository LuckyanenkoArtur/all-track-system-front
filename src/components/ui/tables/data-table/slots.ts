import type { ReactElement } from "react";

export const DATA_TABLE_SLOT = {
  Tabulation: "DataTable.Tabulation",
  Column: "DataTable.Column",
  Pagination: "DataTable.Pagination",
} as const;

export type DataTableSlot =
  (typeof DATA_TABLE_SLOT)[keyof typeof DATA_TABLE_SLOT];

export function getDataTableSlot(
  child: ReactElement,
): DataTableSlot | undefined {
  const { type } = child;

  if (typeof type !== "function" || !("slot" in type)) {
    return undefined;
  }

  const slot = type.slot;

  if (
    slot === DATA_TABLE_SLOT.Tabulation ||
    slot === DATA_TABLE_SLOT.Column ||
    slot === DATA_TABLE_SLOT.Pagination
  ) {
    return slot;
  }

  return undefined;
}
