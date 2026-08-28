import type { DataTableColumnProps } from "./DataTableColumn";
import { getCellValue, getColumnClassName } from "./column.utils";

type ColumnCellProps<T> = {
  column: DataTableColumnProps;
  row: T;
};

export function ColumnCell<T>({ column, row }: ColumnCellProps<T>) {
  return (
    <td className={getColumnClassName(column.align, column.className)}>
      {column.body
        ? column.body(row)
        : column.field
          ? getCellValue(row, column.field)
          : null}
    </td>
  );
}
