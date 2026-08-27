export const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

export type ParsedDateValue = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  hasTime: boolean;
};

export function padDateUnit(value: number) {
  return String(value).padStart(2, "0");
}

export function parseDateValue(value: string): ParsedDateValue | null {
  const match = DATE_VALUE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hasTime = match[4] != null && match[5] != null;
  const hours = hasTime ? Number(match[4]) : 0;
  const minutes = hasTime ? Number(match[5]) : 0;

  const date = new Date(year, month - 1, day, hours, minutes);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day, hours, minutes, hasTime };
}

export function toDateValue(
  date: Date,
  includeTime: boolean,
  time = { hours: date.getHours(), minutes: date.getMinutes() },
) {
  const datePart = `${date.getFullYear()}-${padDateUnit(date.getMonth() + 1)}-${padDateUnit(date.getDate())}`;
  if (!includeTime) return datePart;
  return `${datePart}T${padDateUnit(time.hours)}:${padDateUnit(time.minutes)}`;
}

export function parsedToDate(parsed: ParsedDateValue) {
  return new Date(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    parsed.hours,
    parsed.minutes,
  );
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getMonthGrid(viewDate: Date) {
  const first = startOfMonth(viewDate);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function getWeekdayLabels(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2024, 0, 1 + index)),
  );
}

export function getMonthLabels(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { month: "long" });
  return Array.from({ length: 12 }, (_, month) =>
    formatter.format(new Date(2024, month, 1)),
  );
}

export function formatDateDisplay(
  value: string,
  locale: string,
  includeTime: boolean,
) {
  const parsed = parseDateValue(value);
  if (!parsed) return "";

  const date = parsedToDate(parsed);
  const dateLabel = date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (!includeTime) return dateLabel;

  const timeLabel = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateLabel}  ${timeLabel}`;
}

export function isDayDisabled(day: Date, min?: string, max?: string) {
  const dayValue = toDateValue(day, false);

  if (min && dayValue < min.slice(0, 10)) return true;
  if (max && dayValue > max.slice(0, 10)) return true;
  return false;
}

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  padDateUnit(hour),
);

export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) =>
  padDateUnit(minute),
);

export function getYearOptions() {
  const start = 1970;
  const end = 2100;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
