import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import type { ColumnSort, DataTableColumnProps } from "./DataTableColumn";
import { getColumnClassName } from "./column.utils";
import styles from "./DataColumn.module.scss";

type ColumnHeaderProps = {
  column: DataTableColumnProps;
  sort?: ColumnSort;
  onSort?: (field: string) => void;
};

export function ColumnHeader({ column, sort, onSort }: ColumnHeaderProps) {
  const isActive = sort?.field === column.field;
  const isSortable =
    column.sortable !== false && Boolean(column.field && onSort);

  return (
    <th className={getColumnClassName(column.align, column.className)}>
      {isSortable ? (
        <button
          type="button"
          className={`${styles.sortBtn} ${isActive ? styles.sortActive : ""}`}
          onClick={() => onSort!(column.field!)}
        >
          {column.header}
          {isActive &&
            (sort?.direction === "asc" ? (
              <FiChevronUp size={14} aria-hidden />
            ) : (
              <FiChevronDown size={14} aria-hidden />
            ))}
        </button>
      ) : (
        column.header
      )}
    </th>
  );
}
