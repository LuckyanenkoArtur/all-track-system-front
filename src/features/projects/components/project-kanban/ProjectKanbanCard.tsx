import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiCheckSquare,
  FiFlag,
  FiMoreHorizontal,
  FiPaperclip,
  FiUsers,
} from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { getTaskPriorityLabel } from "../../../tasks/domain/priority.ts";
import type { Project } from "../../domain/project.ts";
import styles from "./ProjectKanbanCard.module.scss";

const VISIBLE_MEMBERS = 3;

type ProjectKanbanCardProps = {
  project: Project;
  dragging?: boolean;
};

function formatKanbanDueDate(isoDate: string, language: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  return new Date(year, month - 1, day).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export function ProjectKanbanCard({
  project,
  dragging = false,
}: ProjectKanbanCardProps) {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const priorityLabel = getTaskPriorityLabel(project.priority, {
    high: t.tasks.high,
    medium: t.tasks.medium,
    low: t.tasks.low,
  });
  const priorityClass =
    project.priority === "high"
      ? styles.priorityHigh
      : project.priority === "medium"
        ? styles.priorityMedium
        : styles.priorityLow;
  const visibleMembers = project.members.slice(0, VISIBLE_MEMBERS);
  const hiddenMembers = project.members.length - visibleMembers.length;

  return (
    <article
      className={`${styles.card} ${dragging ? styles.dragging : ""}`.trim()}
    >
      <header className={styles.header}>
        <button
          type="button"
          className={styles.titleBtn}
          onClick={() => navigate(`/app/projects/${project.id}`)}
        >
          <span className={styles.titleText} title={project.name}>
            {project.name}
          </span>
        </button>
        <div
          className={styles.menu}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Button onClick={() => undefined} ariaLabel={t.projects.actions}>
            <Button.Icon>
              <FiMoreHorizontal size={16} />
            </Button.Icon>
            <Button.Tooltip position="bottom">
              {t.projects.actions}
            </Button.Tooltip>
          </Button>
        </div>
      </header>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <FiFlag size={14} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowLabel}>{t.tasks.priority}</span>
            <span className={`${styles.rowValue} ${priorityClass}`}>
              <FiFlag size={13} aria-hidden />
              {priorityLabel}
            </span>
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <FiUsers size={14} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowLabel}>{t.projects.members}</span>
            {visibleMembers.length > 0 ? (
              <span className={styles.members} role="group">
                {visibleMembers.map((person) => (
                  <FeedItem.Avatar key={person.id} className={styles.avatar}>
                    {person.initials}
                  </FeedItem.Avatar>
                ))}
                {hiddenMembers > 0 ? (
                  <span className={styles.overflow}>+{hiddenMembers}</span>
                ) : null}
              </span>
            ) : (
              <span className={`${styles.rowValue} ${styles.emptyValue}`}>—</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowIcon} aria-hidden>
            <FiCalendar size={14} />
          </span>
          <div className={styles.rowBody}>
            <span className={styles.rowLabel}>{t.tasks.dueDate}</span>
            <span className={styles.rowValue}>
              {formatKanbanDueDate(project.dueDate, language)}
            </span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerItem}>
          <FiCheckSquare size={13} aria-hidden />
          {project.completedTasks}/{project.totalTasks}
        </span>
        <span className={styles.footerItem}>
          <FiPaperclip size={13} aria-hidden />
          {project.fileCount}
        </span>
      </footer>
    </article>
  );
}
