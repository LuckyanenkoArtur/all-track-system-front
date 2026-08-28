import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { FiX } from "react-icons/fi";

import { DATA_TABLE_SLOT } from "../slots";
import styles from "./DataTableTabulation.module.scss";

const DataTableTabulationContext = createContext(false);

function useDataTableTabulation() {
  const isInsideTabulation = useContext(DataTableTabulationContext);

  if (!isInsideTabulation) {
    throw new Error("DataTable.Tab must be used inside DataTable.Tabulation");
  }
}

export type DataTableTabulationProps = PropsWithChildren<{
  ariaLabel: string;
  actions?: ReactNode;
}>;

export type DataTableTabProps = PropsWithChildren<{
  active?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  deleteAriaLabel?: string;
}>;

export function DataTableTabulation({
  children,
  ariaLabel,
  actions,
}: DataTableTabulationProps) {
  return (
    <DataTableTabulationContext.Provider value={true}>
      <div className={styles.chrome}>
        <nav className={styles.tabs} aria-label={ariaLabel}>
          {children}
        </nav>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </DataTableTabulationContext.Provider>
  );
}

DataTableTabulation.slot = DATA_TABLE_SLOT.Tabulation;
DataTableTabulation.displayName = DATA_TABLE_SLOT.Tabulation;

export function DataTableTab({
  children,
  active = false,
  onSelect,
  onDelete,
  deleteAriaLabel,
}: DataTableTabProps) {
  useDataTableTabulation();

  const label = typeof children === "string" ? children : undefined;
  const tabClassName = `${styles.tab} ${onDelete ? styles.tabWithDelete : ""} ${active ? styles.tabActive : ""}`;

  const tabButton = (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={tabClassName}
      onClick={onSelect}
    >
      {children}
    </button>
  );

  if (!onDelete) {
    return tabButton;
  }

  return (
    <div className={styles.tabItem}>
      {tabButton}
      <button
        type="button"
        className={styles.tabDelete}
        aria-label={deleteAriaLabel ?? (label ? `Remove ${label}` : "Remove")}
        onClick={onDelete}
      >
        <FiX size={12} aria-hidden />
      </button>
    </div>
  );
}

DataTableTab.displayName = "DataTable.Tab";
