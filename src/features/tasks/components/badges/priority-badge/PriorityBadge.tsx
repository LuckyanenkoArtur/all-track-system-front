import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowDown, FiArrowUp, FiCheck, FiMinus } from "react-icons/fi";

import type { BadgeVariant } from "@primitive/badge/Badge.tsx";
import Badge from "@primitive/badge/Badge.tsx";
import { useTranslation } from "../../../../../i18n/index.ts";
import type { TaskPriority, TaskPriorityId } from "../../../domain/priority.ts";
import {
  getTaskPriorityLabel,
  getTaskPriorityOptions,
  resolveTaskPriority,
} from "../../../domain/priority.ts";
import styles from "./PriorityBadge.module.scss";

const PRIORITY_PRESENTATION: Record<
  TaskPriorityId,
  { variant: BadgeVariant; Icon: typeof FiArrowUp }
> = {
  high: { variant: "error", Icon: FiArrowUp },
  medium: { variant: "warning", Icon: FiMinus },
  low: { variant: "neutral", Icon: FiArrowDown },
};

const VIEWPORT_PADDING = 8;
const MENU_GAP = 6;

function PriorityBadgeFace({ priority }: { priority: TaskPriorityId }) {
  const { t } = useTranslation();
  const { variant, Icon } = PRIORITY_PRESENTATION[priority];
  const label = getTaskPriorityLabel(priority, {
    high: t.tasks.high,
    medium: t.tasks.medium,
    low: t.tasks.low,
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

type PriorityBadgeProps = {
  priority: TaskPriority | TaskPriorityId;
  onPriorityChange?: (priority: TaskPriorityId) => void;
};

export default function PriorityBadge({
  priority,
  onPriorityChange,
}: PriorityBadgeProps) {
  const { t } = useTranslation();
  const normalizedPriority = resolveTaskPriority(priority).id;
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

  const face = <PriorityBadgeFace priority={normalizedPriority} />;

  if (!onPriorityChange) {
    return face;
  }

  const priorityOptions = getTaskPriorityOptions({
    high: t.tasks.high,
    medium: t.tasks.medium,
    low: t.tasks.low,
  });

  const handleSelect = (next: TaskPriorityId) => {
    setOpen(false);
    if (next === normalizedPriority) return;
    onPriorityChange(next);
  };

  return (
    <div className={styles.picker}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t.tasks.priority}
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
              aria-label={t.tasks.priority}
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              {priorityOptions.map((option) => {
                const selected = option.value === normalizedPriority;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.option} ${selected ? styles.selected : ""}`.trim()}
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(option.value)}
                  >
                    <PriorityBadgeFace priority={option.value} />
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
