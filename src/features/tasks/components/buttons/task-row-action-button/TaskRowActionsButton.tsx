import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMoreHorizontal,
  FiPlus,
} from "react-icons/fi";

import { Button } from "@primitive/button/Button";
import type { Task } from "../../../domain/others";
import { isTerminalTaskStatus } from "../../../utils/taskStatusUtils";
import styles from "./TaskRowActionsButton.module.scss";

type TaskRowActionsButtonProps = {
  task: Task;
  isTracking: boolean;
  labels: {
    actions: string;
    startTracking: string;
    stopTracking: string;
    completeTask: string;
    addManualTime: string;
    logBudgetExpense: string;
  };
  onToggleTracking?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onAddManualTime?: (taskId: string) => void;
  onLogBudgetExpense?: (taskId: string) => void;
};

export function TaskRowActionsButton({
  task,
  isTracking,
  labels,
  onToggleTracking = () => {},
  onComplete = () => {},
  onAddManualTime = () => {},
  onLogBudgetExpense = () => {},
}: TaskRowActionsButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggleMenu = () => {
    setOpen((value) => !value);
  };

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  const hasActions =
    onToggleTracking || onComplete || onAddManualTime || onLogBudgetExpense;

  if (!hasActions) return null;

  return (
    <div
      className={styles.root}
      ref={rootRef}
      onClick={(event: MouseEvent) => event.stopPropagation()}
    >
      <Button
        onClick={handleToggleMenu}
        className={`${styles.menuBtn} ${open ? styles.menuBtnOpen : ""}`}
        active={open}
        ariaLabel={labels.actions}
        ariaExpanded={open}
        ariaHasPopup="menu"
      >
        <Button.Icon>
          <FiMoreHorizontal size={18} />
        </Button.Icon>
      </Button>

      {open && (
        <div className={styles.menu} role="menu">
          {onComplete && (
            <Button
              onClick={() => handleAction(() => onComplete(task.id))}
              className={styles.menuItem}
              disabled={isTerminalTaskStatus(task.status)}
            >
              <Button.Icon>
                <FiCheckCircle size={16} />
              </Button.Icon>
              <Button.Text>{labels.completeTask}</Button.Text>
            </Button>
          )}
          {onToggleTracking && !isTerminalTaskStatus(task.status) && (
            <Button
              onClick={() => handleAction(() => onToggleTracking(task.id))}
              className={styles.menuItem}
            >
              <Button.Icon>
                <FiClock size={16} />
              </Button.Icon>
              <Button.Text>
                {isTracking ? labels.stopTracking : labels.startTracking}
              </Button.Text>
            </Button>
          )}
          {onAddManualTime && (
            <Button
              onClick={() => handleAction(() => onAddManualTime(task.id))}
              className={styles.menuItem}
            >
              <Button.Icon>
                <FiPlus size={16} />
              </Button.Icon>
              <Button.Text>{labels.addManualTime}</Button.Text>
            </Button>
          )}
          {onLogBudgetExpense && (
            <Button
              onClick={() => handleAction(() => onLogBudgetExpense(task.id))}
              className={styles.menuItem}
            >
              <Button.Icon>
                <FiDollarSign size={16} />
              </Button.Icon>
              <Button.Text>{labels.logBudgetExpense}</Button.Text>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
