import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import Badge from "@primitive/badge/Badge.tsx";
import { Card } from "@layout/card/Card.tsx";
import {
  addMonths,
  getMonthGrid,
  getWeekdayLabels,
  isSameDay,
  startOfMonth,
} from "@input/date-picker/datePicker.utils.ts";
import { useTranslation } from "../../../../i18n/index.ts";
import {
  PROJECT_MEETINGS,
  type ProjectMeeting,
} from "../../data/projectEvents.ts";
import type { Project } from "../../domain/project.ts";
import styles from "./ProjectEventsCard.module.scss";

type ProjectEventsCardProps = {
  project: Project;
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatClock(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProjectEventsCard({ project }: ProjectEventsCardProps) {
  const { t, language } = useTranslation();
  const locale = language === "ru" ? "ru-RU" : "en-GB";
  const meetings = useMemo(
    () =>
      PROJECT_MEETINGS.filter((meeting) => meeting.projectId === project.id).sort(
        (a, b) => a.start.localeCompare(b.start),
      ),
    [project.id],
  );
  const initialDay = meetings[0] ? new Date(meetings[0].start) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(initialDay));
  const [selectedDay, setSelectedDay] = useState(() => initialDay);

  const weekdayLabels = useMemo(
    () =>
      getWeekdayLabels(locale).map((label) => label.slice(0, 2).toUpperCase()),
    [locale],
  );
  const days = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);
  const eventDays = useMemo(() => {
    const keys = new Set<string>();
    meetings.forEach((meeting) => keys.add(dayKey(new Date(meeting.start))));
    return keys;
  }, [meetings]);
  const selectedMeetings = meetings.filter((meeting) =>
    isSameDay(new Date(meeting.start), selectedDay),
  );
  const monthLabel = visibleMonth.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const selectDay = (day: Date) => {
    setSelectedDay(day);
    if (
      day.getMonth() !== visibleMonth.getMonth() ||
      day.getFullYear() !== visibleMonth.getFullYear()
    ) {
      setVisibleMonth(startOfMonth(day));
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>{t.projects.details.eventsTitle}</h2>
        <Button onClick={() => undefined} ariaLabel={t.projects.details.createEvent}>
          <Button.Icon>
            <FiPlus size={16} />
          </Button.Icon>
          <Button.Tooltip position="bottom">
            {t.projects.details.createEvent}
          </Button.Tooltip>
        </Button>
      </div>

      <div className={styles.body}>
        <div className={styles.calendar}>
          <div className={styles.monthRow}>
            <button
              type="button"
              className={styles.monthButton}
              aria-label={t.projects.details.previousMonth}
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            >
              <FiChevronLeft size={16} aria-hidden />
            </button>
            <p className={styles.monthLabel}>{monthLabel}</p>
            <button
              type="button"
              className={styles.monthButton}
              aria-label={t.projects.details.nextMonth}
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            >
              <FiChevronRight size={16} aria-hidden />
            </button>
          </div>

          <div className={styles.weekdays} aria-hidden>
            {weekdayLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>

          <div className={styles.days}>
            {days.map((day) => {
              const inMonth = day.getMonth() === visibleMonth.getMonth();
              const selected = isSameDay(day, selectedDay);
              const hasEvent = eventDays.has(dayKey(day));
              const label = day.toLocaleDateString(locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              return (
                <button
                  key={dayKey(day)}
                  type="button"
                  className={[
                    styles.day,
                    !inMonth ? styles.dayMuted : "",
                    selected ? styles.daySelected : "",
                    hasEvent ? styles.dayEvent : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => selectDay(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.schedule}>
          <h3 className={styles.scheduleTitle}>
            {t.projects.details.scheduledEvents}
          </h3>
          {selectedMeetings.length === 0 ? (
            <p className={styles.empty}>{t.projects.details.noEvents}</p>
          ) : (
            <ul className={styles.eventList}>
              {selectedMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} locale={locale} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function MeetingCard({
  meeting,
  locale,
}: {
  meeting: ProjectMeeting;
  locale: string;
}) {
  return (
    <li className={styles.event}>
      <p className={styles.eventTitle}>{meeting.title}</p>
      <p className={styles.eventTime}>
        {formatClock(meeting.start, locale)} – {formatClock(meeting.end, locale)}
      </p>
      <Badge variant="info" compact>
        <Badge.Label>{meeting.tag}</Badge.Label>
      </Badge>
    </li>
  );
}
