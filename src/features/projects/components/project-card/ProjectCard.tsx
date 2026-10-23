import { Link } from "react-router-dom";
import {
  FiClock,
  FiDollarSign,
  FiMoreHorizontal,
  FiPaperclip,
} from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import ProgressBar from "@primitive/progress-bar/ProgressBar.tsx";
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
  const visibleMembers = project.members.slice(0, VISIBLE_MEMBERS);
  const hiddenCount = project.members.length - visibleMembers.length;
  const timeSpent = formatProjectTimeSpent(project.timeSpentMinutes, language);
  const moneySpent = formatProjectMoneySpent(project.moneySpent, language);
  const openLabel = `${t.projects.openProject}: ${project.name}`;

  return (
    <article className={styles.card}>
      <div className={styles.folder}>
        <div className={styles.tabRow}>
          <Link
            to={`/app/projects/${project.id}`}
            className={styles.folderTab}
            draggable={false}
            aria-label={openLabel}
            title={project.name}
          >
            <span className={styles.tabFace}>
              <span className={styles.tabLabel}>{project.name}</span>
            </span>
            <svg
              className={styles.tabShoulder}
              viewBox="0 0 32 37"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className={styles.shoulderFill}
                d="M0 0H3C13 0 16 16 22 29C25 34.2 28 36 32 36H0Z"
              />
              <path
                className={styles.shoulderEdge}
                d="M0 .5H3C13 .5 16 16 22 28.5C25 33.7 28 35.5 32 35.5H38"
              />
            </svg>
          </Link>
        </div>

        <div className={styles.body}>
          <Link
            to={`/app/projects/${project.id}`}
            className={styles.bodyLink}
            draggable={false}
            aria-hidden="true"
            tabIndex={-1}
          />

          <div className={styles.headerActions}>
            <Button onClick={() => undefined} ariaLabel={t.projects.actions}>
              <Button.Icon>
                <FiMoreHorizontal size={18} />
              </Button.Icon>
              <Button.Tooltip position="bottom">
                {t.projects.actions}
              </Button.Tooltip>
            </Button>
          </div>

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
      </div>
    </article>
  );
}
