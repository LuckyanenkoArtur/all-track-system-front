import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import type { DataTableColumnProps } from "./column/DataTableColumn";
import { DATA_TABLE_SLOT, getDataTableSlot } from "./slots";

export type ParsedDataTableChildren = {
  tabulation: ReactElement | null;
  columns: DataTableColumnProps[];
  pagination: ReactElement | null;
};

function visitElements(
  children: ReactNode,
  visit: (child: ReactElement) => void,
) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    if (child.type === Fragment) {
      visitElements(
        (child.props as { children?: ReactNode }).children,
        visit,
      );
      return;
    }

    visit(child);
  });
}

export function parseDataTableChildren(
  children: ReactNode,
): ParsedDataTableChildren {
  let tabulation: ReactElement | null = null;
  let pagination: ReactElement | null = null;
  const columns: DataTableColumnProps[] = [];

  visitElements(children, (child) => {
    const slot = getDataTableSlot(child);

    if (slot === DATA_TABLE_SLOT.Tabulation) {
      tabulation = child;
      return;
    }

    if (slot === DATA_TABLE_SLOT.Pagination) {
      pagination = child;
      return;
    }

    if (slot === DATA_TABLE_SLOT.Column) {
      columns.push(child.props as DataTableColumnProps);
    }
  });

  return { tabulation, columns, pagination };
}
