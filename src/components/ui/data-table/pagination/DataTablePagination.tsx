import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { DATA_TABLE_SLOT } from "../slots";
import styles from "./DataTablePagination.module.scss";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export type DataTablePaginationLabels = {
  showing: string;
  rowsPerPage: string;
  page: string;
  of: string;
  previous: string;
  next: string;
};

export type DataTablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  labels: DataTablePaginationLabels;
};

export function DataTablePagination({
  page,
  totalPages,
  total,
  startIndex,
  endIndex,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  labels,
}: DataTablePaginationProps) {
  const from = total === 0 ? 0 : startIndex + 1;
  const to = endIndex;

  return (
    <div className={styles.pagination}>
      <p className={styles.paginationSummary}>
        {labels.showing} {from}–{to} {labels.of} {total}
      </p>

      <div className={styles.paginationControls}>
        <label className={styles.pageSizeControl}>
          <span>{labels.rowsPerPage}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.pageNav}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={labels.previous}
          >
            <FiChevronLeft size={16} aria-hidden />
          </button>
          <span className={styles.pageIndicator}>
            {labels.page} {page} {labels.of} {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={labels.next}
          >
            <FiChevronRight size={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

DataTablePagination.slot = DATA_TABLE_SLOT.Pagination;
DataTablePagination.displayName = DATA_TABLE_SLOT.Pagination;
