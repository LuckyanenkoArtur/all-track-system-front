import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { BiColumns } from "react-icons/bi";
import { Button } from "@primitive/button/Button";
import { useTranslation } from "../../../../../i18n";
import styles from "./TaskColumnVisibilityButton.module.scss";

const VIEWPORT_PADDING = 8;
const MENU_GAP = 6;

export type TaskColumnVisibilityOption = {
  id: string;
  label: string;
  hideable: boolean;
};

type TaskColumnVisibilityButtonProps = {
  columns: TaskColumnVisibilityOption[];
  visibility: Record<string, boolean>;
  hiddenCount: number;
  onToggle: (id: string) => void;
  onShowAll: () => void;
};

export function TaskColumnVisibilityButton({
  columns,
  visibility,
  hiddenCount,
  onToggle,
  onShowAll,
}: TaskColumnVisibilityButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const titleId = useId();

  const closeMenu = useCallback(() => {
    setOpen(false);
    const triggerButton = triggerRef.current?.querySelector("button");
    triggerButton?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    let top = triggerRect.bottom + MENU_GAP;
    let left = triggerRect.right - menuRect.width;

    if (top + menuRect.height > window.innerHeight - VIEWPORT_PADDING) {
      top = Math.max(
        VIEWPORT_PADDING,
        triggerRect.top - menuRect.height - MENU_GAP,
      );
    }

    if (left < VIEWPORT_PADDING) {
      left = Math.min(
        triggerRect.left,
        window.innerWidth - menuRect.width - VIEWPORT_PADDING,
      );
    }

    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - menuRect.width - VIEWPORT_PADDING),
    );

    setMenuPos({ top, left });
    const firstCheckbox = menu.querySelector<HTMLInputElement>(
      "input:not(:disabled)",
    );
    firstCheckbox?.focus({ preventScroll: true });
  }, [open, columns.length]);

  useEffect(() => {
    if (!open) return;

    const getFocusable = () => {
      const menu = menuRef.current;
      if (!menu) return [] as HTMLElement[];
      return [
        ...menu.querySelectorAll<HTMLElement>(
          "input:not(:disabled), button:not(:disabled)",
        ),
      ];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open, closeMenu]);

  return (
    <div className={styles.root} ref={triggerRef}>
      <Button
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        active={open}
        ariaExpanded={open}
        ariaHasPopup="dialog"
        ariaControls={open ? menuId : undefined}
      >
        <Button.Icon>
          <BiColumns size={16} />
        </Button.Icon>
        <Button.Text>{t.tasks.columns}</Button.Text>
        <Button.Badge>{hiddenCount}</Button.Badge>
      </Button>

      {open &&
        createPortal(
          <>
            <div
              className={styles.backdrop}
              onClick={closeMenu}
              aria-hidden
            />
            <div
              ref={menuRef}
              className={styles.menu}
              role="dialog"
              id={menuId}
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              style={{
                top: menuPos?.top ?? 0,
                left: menuPos?.left ?? 0,
                visibility: menuPos ? "visible" : "hidden",
              }}
            >
              <p className={styles.legend} id={titleId}>
                {t.tasks.columnsMenu}
              </p>
              <div className={styles.list} role="group" aria-labelledby={titleId}>
                {columns.map((column) => {
                  const checked = visibility[column.id] !== false;
                  const locked = !column.hideable;

                  return (
                    <label
                      key={column.id}
                      className={`${styles.option} ${locked ? styles.optionLocked : ""}`.trim()}
                    >
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={checked}
                        disabled={locked}
                        onChange={() => onToggle(column.id)}
                      />
                      <span className={styles.label}>{column.label}</span>
                      {locked ? (
                        <span className={styles.lockHint}>
                          {t.tasks.columnAlwaysVisible}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.showAll}
                  onClick={onShowAll}
                  disabled={hiddenCount === 0}
                >
                  {t.tasks.showAllColumns}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
