import type { ReactNode } from "react";

import styles from "./DataColumn.module.scss";

export function getCellValue<T>(row: T, field: string): ReactNode {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const value = (row as Record<string, unknown>)[field];

  if (value == null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return String(value);
  }

  return value as ReactNode;
}

export function getColumnClassName(
  align?: "left" | "right",
  className?: string,
): string | undefined {
  const classes = [
    align === "right" ? styles.alignRight : undefined,
    className,
  ].filter(Boolean);

  return classes.length > 0 ? classes.join(" ") : undefined;
}
