import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiPauseCircle,
  FiXCircle,
} from "react-icons/fi";

import type { BadgeVariant } from "@primitive/badge/Badge.tsx";
import Badge from "@primitive/badge/Badge.tsx";
import { useTranslation } from "../../../../../i18n/index.ts";
import type { TaskStatus } from "../../../domain/others.ts";
import {
  getTaskStatusLabel,
  getTaskStatusOptions,
  normalizeTaskStatus,
} from "../../../utils/taskStatusUtils.ts";
import styles from "./StatusBadge.module.scss";

const STATUS_PRESENTATION: Record<
  TaskStatus,
  { variant: BadgeVariant; Icon: typeof FiCircle }
> = {
  open: { variant: "neutral", Icon: FiCircle },
  onHold: { variant: "warning", Icon: FiPauseCircle },
  inProgress: { variant: "info", Icon: FiAlertCircle },
  completed: { variant: "success", Icon: FiCheckCircle },
  cancelled: { variant: "error", Icon: FiXCircle },
};

const VIEWPORT_PADDING = 8;
const MENU_GAP = 6;

function StatusBadgeFace({ status }: { status: TaskStatus }) {
  const { t } = useTranslation();
  const { variant, Icon } = STATUS_PRESENTATION[status];
  const label = getTaskStatusLabel(status, {
    open: t.tasks.open,
    onHold: t.tasks.onHold,
    inProgress: t.tasks.inProgress,
    completed: t.tasks.completed,
    cancelled: t.tasks.cancelled,
  });

  return (
    <Badge variant={variant}>
      <Badge.Icon>
        <Icon size={14} aria-hidden />
      </Badge.Icon>
      <Badge.Label>{label}</Badge.Label>
    </Badge>
  );
}

type StatusBadgeProps = {
  status: string;
  onStatusChange?: (status: TaskStatus) => void;
};

export default function StatusBadge({
  status,
  onStatusChange,
}: StatusBadgeProps) {
  const { t } = useTranslation();
  const normalizedStatus = normalizeTaskStatus(status);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useLayoutEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    let top = triggerRect.bottom + MENU_GAP;
    let left = triggerRect.left;

    if (top + menuRect.height > window.innerHeight - VIEWPORT_PADDING) {
      top = Math.max(
        VIEWPORT_PADDING,
        triggerRect.top - menuRect.height - MENU_GAP,
      );
    }

    if (left + menuRect.width > window.innerWidth - VIEWPORT_PADDING) {
      left = Math.max(
        VIEWPORT_PADDING,
        window.innerWidth - menuRect.width - VIEWPORT_PADDING,
      );
    }

    setMenuPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setOpen(false);
    };

    const close = () => setOpen(false);

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const face = <StatusBadgeFace status={normalizedStatus} />;

  if (!onStatusChange) {
    return face;
  }

  const statusOptions = getTaskStatusOptions({
    open: t.tasks.open,
    onHold: t.tasks.onHold,
    inProgress: t.tasks.inProgress,
    completed: t.tasks.completed,
    cancelled: t.tasks.cancelled,
  });

  const handleSelect = (next: TaskStatus) => {
    setOpen(false);
    if (next === normalizedStatus) return;
    onStatusChange(next);
  };

  return (
    <div className={styles.picker}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t.tasks.details.changeStatus}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        {face}
      </button>

      {open &&
        createPortal(
          <>
            <div
              className={styles.backdrop}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              ref={menuRef}
              className={styles.menu}
              role="listbox"
              id={listId}
              aria-label={t.tasks.details.changeStatus}
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              {statusOptions.map((option) => {
                const selected = option.value === normalizedStatus;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.option} ${selected ? styles.selected : ""}`.trim()}
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(option.value)}
                  >
                    <StatusBadgeFace status={option.value} />
                    {selected ? (
                      <FiCheck size={14} className={styles.check} aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
