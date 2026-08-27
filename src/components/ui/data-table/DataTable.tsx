import { type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { ColumnCell } from "./column/ColumnCell";
import { ColumnHeader } from "./column/ColumnHeader";
import {
  DataTableColumn,
  type ColumnSort,
  type DataTableColumnProps,
} from "./column/DataTableColumn";
import { DataTablePagination } from "./pagination/DataTablePagination";
import { parseDataTableChildren } from "./parseDataTableChildren";
import {
  DataTableTab,
  DataTableTabulation,
} from "./tabulation/DataTableTabulation";

import styles from "./DataTable.module.scss";

type DataTableProps<T> = {
  value: T[];
  children: ReactNode;
  emptyLabel?: string;
  sort?: ColumnSort;
  onSort?: (field: string) => void;
  onRowClick?: (row: T) => void;
  onRowContextMenu?: (row: T, event: MouseEvent) => void;
  getRowKey?: (row: T) => string;
  getRowAriaLabel?: (row: T) => string | undefined;
};

type DataTableRowProps<T> = {
  row: T;
  columns: DataTableColumnProps[];
  onRowClick?: (row: T) => void;
  onRowContextMenu?: (row: T, event: MouseEvent) => void;
  ariaLabel?: string;
};

function DataTableRow<T>({
  row,
  columns,
  onRowClick,
  onRowContextMenu,
  ariaLabel,
}: DataTableRowProps<T>) {
  const isClickable = Boolean(onRowClick);

  return (
    <tr
      className={isClickable ? styles.clickableRow : undefined}
      onClick={isClickable ? () => onRowClick?.(row) : undefined}
      onContextMenu={
        onRowContextMenu
          ? (event) => onRowContextMenu(row, event)
          : undefined
      }
      onKeyDown={
        isClickable
          ? (event: KeyboardEvent<HTMLTableRowElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRowClick?.(row);
              }
            }
          : undefined
      }
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? "button" : undefined}
      aria-label={isClickable ? ariaLabel : undefined}
    >
      {columns.map((column) => (
        <ColumnCell
          key={column.field ?? column.header}
          column={column}
          row={row}
        />
      ))}
    </tr>
  );
}

function DataTableRoot<T>({
  value = [],
  children,
  emptyLabel = "No results",
  sort,
  onSort,
  onRowClick,
  onRowContextMenu,
  getRowKey,
  getRowAriaLabel,
}: DataTableProps<T>) {
  const { tabulation, columns, pagination } = parseDataTableChildren(children);
  const columnCount = columns.length;

  return (
    <div className={styles.tableCard}>
      {tabulation}

      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <ColumnHeader
                    key={column.field ?? column.header}
                    column={column}
                    sort={sort}
                    onSort={onSort}
                  />
                ))}
              </tr>
            </thead>

            <tbody>
              {value.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className={styles.emptyState}>
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                value.map((row, index) => (
                  <DataTableRow
                    key={getRowKey?.(row) ?? String(index)}
                    row={row}
                    columns={columns}
                    onRowClick={onRowClick}
                    onRowContextMenu={onRowContextMenu}
                    ariaLabel={getRowAriaLabel?.(row)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination}
    </div>
  );
}

type DataTableCompound = typeof DataTableRoot & {
  Tabulation: typeof DataTableTabulation;
  Tab: typeof DataTableTab;
  Column: typeof DataTableColumn;
  Pagination: typeof DataTablePagination;
  displayName: string;
};

export const DataTable = DataTableRoot as DataTableCompound;

DataTable.Tabulation = DataTableTabulation;
DataTable.Tab = DataTableTab;
DataTable.Column = DataTableColumn;
DataTable.Pagination = DataTablePagination;
DataTable.displayName = "DataTable";
