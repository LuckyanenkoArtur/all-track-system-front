import { useId } from "react";
import { Link } from "react-router-dom";
import {
  FiClock,
  FiDollarSign,
  FiMoreHorizontal,
  FiPaperclip,
} from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import ProgressBar from "@primitive/progress-bar/ProgressBar.tsx";
import Title from "@primitive/title/Title.tsx";
import { Card } from "@layout/card/Card.tsx";
import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import PriorityBadge from "../../../tasks/components/badges/priority-badge/PriorityBadge.tsx";
import StatusBadge from "../../../tasks/components/badges/status-badge/StatusBadge.tsx";
import {
  formatProjectMoneySpent,
  formatProjectTimeSpent,
  type Project,
} from "../../domain/project.ts";
import styles from "./ProjectCard.module.scss";

const VISIBLE_MEMBERS = 3;

type ProjectCardProps = {
  project: Project;
  hideStatus?: boolean;
};

function formatDueDate(isoDate: string, language: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  return new Date(year, month - 1, day).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
}

export function ProjectCard({ project, hideStatus = false }: ProjectCardProps) {
  const { t, language } = useTranslation();
  const washId = `folder-wash-${useId().replace(/:/g, "")}`;
  const visibleMembers = project.members.slice(0, VISIBLE_MEMBERS);
  const hiddenCount = project.members.length - visibleMembers.length;
  const timeSpent = formatProjectTimeSpent(project.timeSpentMinutes, language);
  const moneySpent = formatProjectMoneySpent(project.moneySpent, language);

  return (
    <Card className={styles.card}>
      <Link
        to={`/app/projects/${project.id}`}
        className={styles.folderTab}
        draggable={false}
        aria-label={`${t.projects.openProject}: ${project.name}`}
      >
        <svg
          className={styles.shoulder}
          viewBox="0 0 28 40"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={washId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--folder-wash-strong)" />
              <stop offset="100%" stopColor="var(--folder-wash)" />
            </linearGradient>
          </defs>
          <path fill={`url(#${washId})`} d="M0 0H8L28 40H0Z" />
          <path className={styles.shoulderLine} d="M0 0.5H8L27.5 39.5" />
        </svg>
        <Title
          as="h2"
          text={project.name}
          title={project.name}
          className={styles.name}
        />
      </Link>

      <div className={styles.body}>
        <header className={styles.header}>
          <Button onClick={() => undefined} ariaLabel={t.projects.actions}>
            <Button.Icon>
              <FiMoreHorizontal size={18} />
            </Button.Icon>
            <Button.Tooltip position="bottom">{t.projects.actions}</Button.Tooltip>
          </Button>
        </header>

        <div className={styles.top}>
          {project.category ? (
            <p className={styles.category}>{project.category}</p>
          ) : null}
          <div className={styles.badges}>
            {hideStatus ? null : <StatusBadge status={project.status} />}
            <PriorityBadge priority={project.priority} />
          </div>
        </div>

        <div className={styles.progress}>
          <ProgressBar
            completed={project.completedTasks}
            total={project.totalTasks}
          >
            <ProgressBar.Header text={t.projects.progress} />
            <ProgressBar.Body />
          </ProgressBar>
        </div>

        <ul className={styles.stats} aria-label={t.projects.stats}>
          <li
            className={styles.stat}
            title={t.projects.totalTime}
            aria-label={`${t.projects.totalTime}: ${timeSpent}`}
          >
            <FiClock size={13} aria-hidden />
            <span>{timeSpent}</span>
          </li>
          <li
            className={styles.stat}
            title={t.projects.totalSpend}
            aria-label={`${t.projects.totalSpend}: ${moneySpent}`}
          >
            <FiDollarSign size={13} aria-hidden />
            <span>{moneySpent}</span>
          </li>
          <li
            className={styles.stat}
            title={t.projects.files}
            aria-label={`${t.projects.files}: ${project.fileCount}`}
          >
            <FiPaperclip size={13} aria-hidden />
            <span>{project.fileCount}</span>
          </li>
        </ul>

        <footer className={styles.meta}>
          {project.members.length > 0 ? (
            <div
              className={styles.members}
              role="group"
              aria-label={t.projects.members}
            >
              {visibleMembers.map((person) => (
                <FeedItem.Avatar key={person.id} className={styles.member}>
                  {person.initials}
                </FeedItem.Avatar>
              ))}
              {hiddenCount > 0 ? (
                <span className={styles.memberOverflow}>+{hiddenCount}</span>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          <p className={styles.due}>
            {t.projects.due} {formatDueDate(project.dueDate, language)}
          </p>
        </footer>
      </div>
    </Card>
  );
}
