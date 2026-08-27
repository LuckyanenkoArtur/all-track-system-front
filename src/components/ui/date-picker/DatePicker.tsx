import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

import Badge from "../badge/Badge";
import { useTranslation } from "../../../i18n";
import {
  addMonths,
  formatDateDisplay,
  getMonthGrid,
  getMonthLabels,
  getWeekdayLabels,
  getYearOptions,
  HOUR_OPTIONS,
  isDayDisabled,
  isSameDay,
  MINUTE_OPTIONS,
  padDateUnit,
  parsedToDate,
  parseDateValue,
  startOfMonth,
  toDateValue,
} from "./datePicker.utils";
import styles from "./DatePicker.module.scss";

const POPOVER_GAP = 6;
const POPOVER_PADDING = 8;
const POPOVER_MIN_WIDTH = 292;

export type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  includeTime?: boolean;
  required?: boolean;
  requiredLabel?: string;
  min?: string;
  max?: string;
};

export function DatePicker({
  label,
  value,
  onChange,
  placeholder,
  icon,
  className = "",
  includeTime = false,
  required = false,
  requiredLabel,
  min,
  max,
}: DatePickerProps) {
  const { t, language } = useTranslation();
  const locale = language === "ru" ? "ru-RU" : "en-US";
  const labels = t.common.datePicker;

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});

  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const parsed = useMemo(() => parseDateValue(value), [value]);
  const selectedDate = parsed ? parsedToDate(parsed) : null;
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const monthLabels = useMemo(() => getMonthLabels(locale), [locale]);
  const yearOptions = useMemo(() => getYearOptions(), []);
  const monthDays = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const displayValue = useMemo(
    () => formatDateDisplay(value, locale, includeTime),
    [includeTime, locale, value],
  );

  const toggleOpen = () => {
    if (!open) {
      setViewDate(startOfMonth(selectedDate ?? new Date()));
    }
    setOpen((current) => !current);
  };

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const anchor = controlRef.current?.getBoundingClientRect();
      const popover = popoverRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const width = Math.max(anchor.width, POPOVER_MIN_WIDTH);
      const height = popover?.height ?? 340;
      let top = anchor.bottom + POPOVER_GAP;
      if (top + height > window.innerHeight - POPOVER_PADDING) {
        top = Math.max(POPOVER_PADDING, anchor.top - height - POPOVER_GAP);
      }

      let left = anchor.left;
      if (left + width > window.innerWidth - POPOVER_PADDING) {
        left = Math.max(
          POPOVER_PADDING,
          window.innerWidth - width - POPOVER_PADDING,
        );
      }

      setPopoverStyle({ top, left, width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, viewDate, includeTime]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const emitDate = (day: Date, hours = parsed?.hours ?? 0, minutes = parsed?.minutes ?? 0) => {
    onChange(toDateValue(day, includeTime, { hours, minutes }));
    if (!includeTime) setOpen(false);
  };

  const handleClear = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange("");
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    emitDate(
      today,
      includeTime ? today.getHours() : 0,
      includeTime ? today.getMinutes() : 0,
    );
    setViewDate(startOfMonth(today));
  };

  const handleTimeChange = (next: { hours?: number; minutes?: number }) => {
    if (!selectedDate) return;
    emitDate(
      selectedDate,
      next.hours ?? parsed?.hours ?? 0,
      next.minutes ?? parsed?.minutes ?? 0,
    );
  };

  return (
    <div className={`${styles.field} ${className}`.trim()} ref={rootRef}>
      <span className={styles.label}>
        {label}
        {requiredLabel ? (
          <Badge variant="info" compact>
            <Badge.Label>{requiredLabel}</Badge.Label>
          </Badge>
        ) : null}
      </span>

      <div className={styles.controlWrap}>
        <div
          ref={controlRef}
          className={`${styles.control} ${open ? styles.controlOpen : ""}`.trim()}
        >
          <button
            type="button"
            className={styles.trigger}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={listId}
            onClick={toggleOpen}
          >
            {icon ? <span className={styles.icon}>{icon}</span> : null}
            <span
              className={`${styles.triggerText} ${displayValue ? styles.hasValue : ""}`}
            >
              {displayValue || placeholder || labels.placeholder}
            </span>
          </button>

          {value ? (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label={labels.clear}
              onClick={handleClear}
            >
              <FiX size={14} aria-hidden />
            </button>
          ) : null}

          <input
            className={styles.hiddenInput}
            value={value}
            readOnly
            required={required}
            tabIndex={-1}
            aria-hidden
          />
        </div>

        {open
          ? createPortal(
              <div
                ref={popoverRef}
                id={listId}
                className={styles.popover}
                style={popoverStyle}
                role="dialog"
                aria-label={label}
              >
                <div className={styles.header}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    aria-label={labels.previousMonth}
                    onClick={() => setViewDate((current) => addMonths(current, -1))}
                  >
                    <FiChevronLeft size={16} aria-hidden />
                  </button>

                  <div className={styles.monthYear}>
                    <select
                      className={styles.monthSelect}
                      aria-label={monthLabels[viewDate.getMonth()]}
                      value={viewDate.getMonth()}
                      onChange={(event) =>
                        setViewDate(
                          new Date(
                            viewDate.getFullYear(),
                            Number(event.target.value),
                            1,
                          ),
                        )
                      }
                    >
                      {monthLabels.map((monthLabel, month) => (
                        <option key={monthLabel} value={month}>
                          {monthLabel}
                        </option>
                      ))}
                    </select>
                    <select
                      className={styles.yearSelect}
                      aria-label={String(viewDate.getFullYear())}
                      value={viewDate.getFullYear()}
                      onChange={(event) =>
                        setViewDate(
                          new Date(Number(event.target.value), viewDate.getMonth(), 1),
                        )
                      }
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className={styles.navBtn}
                    aria-label={labels.nextMonth}
                    onClick={() => setViewDate((current) => addMonths(current, 1))}
                  >
                    <FiChevronRight size={16} aria-hidden />
                  </button>
                </div>

                <div className={styles.weekdays}>
                  {weekdayLabels.map((weekday, index) => (
                    <span key={`${weekday}-${index}`}>{weekday}</span>
                  ))}
                </div>

                <div className={styles.grid}>
                  {monthDays.map((day) => {
                    const inMonth = day.getMonth() === viewDate.getMonth();
                    const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const today = isSameDay(day, new Date());
                    const disabled = isDayDisabled(day, min, max);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={disabled}
                        className={[
                          styles.day,
                          inMonth ? "" : styles.dayMuted,
                          selected ? styles.daySelected : "",
                          today ? styles.dayToday : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => emitDate(day)}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>

                {includeTime ? (
                  <div className={styles.timeRow}>
                    <label className={styles.timeField}>
                      <span>{labels.hour}</span>
                      <select
                        value={padDateUnit(parsed?.hours ?? 0)}
                        disabled={!selectedDate}
                        onChange={(event) =>
                          handleTimeChange({ hours: Number(event.target.value) })
                        }
                      >
                        {HOUR_OPTIONS.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.timeField}>
                      <span>{labels.minute}</span>
                      <select
                        value={padDateUnit(parsed?.minutes ?? 0)}
                        disabled={!selectedDate}
                        onChange={(event) =>
                          handleTimeChange({ minutes: Number(event.target.value) })
                        }
                      >
                        {MINUTE_OPTIONS.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}

                <div className={styles.footer}>
                  <button
                    type="button"
                    className={styles.footerBtn}
                    onClick={handleToday}
                    disabled={isDayDisabled(new Date(), min, max)}
                  >
                    {labels.today}
                  </button>
                  <button
                    type="button"
                    className={styles.footerBtn}
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    disabled={!value}
                  >
                    {labels.clear}
                  </button>
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}
