import { Link } from "react-router-dom";
import { FiClock, FiDollarSign, FiPaperclip } from "react-icons/fi";

import ProgressBar from "@primitive/progress-bar/ProgressBar.tsx";
import Title from "@primitive/title/Title.tsx";
import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import PriorityBadge from "../../../tasks/components/badges/priority-badge/PriorityBadge.tsx";
import StatusBadge from "../../../tasks/components/badges/status-badge/StatusBadge.tsx";
import {
  formatProjectMoneySpent,
  formatProjectTimeSpent,
  type Project,
} from "../../domain/project.ts";
import styles from "./ProjectListView.module.scss";

const VISIBLE_MEMBERS = 3;

type ProjectListViewProps = {
  projects: Project[];
};

function formatDueDate(isoDate: string, language: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  return new Date(year, month - 1, day).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  const { t, language } = useTranslation();

  return (
    <ul className={styles.list} aria-label={t.projects.listView}>
      {projects.map((project) => {
        const visibleMembers = project.members.slice(0, VISIBLE_MEMBERS);
        const hiddenCount = project.members.length - visibleMembers.length;
        const timeSpent = formatProjectTimeSpent(
          project.timeSpentMinutes,
          language,
        );
        const moneySpent = formatProjectMoneySpent(project.moneySpent, language);

        return (
          <li key={project.id} className={styles.row}>
            <Link
              to={`/app/projects/${project.id}`}
              className={styles.main}
              aria-label={`${t.projects.openProject}: ${project.name}`}
            >
              <div className={styles.identity}>
                <Title
                  as="h2"
                  text={project.name}
                  title={project.name}
                  className={styles.name}
                />
                {project.category ? (
                  <span className={styles.category}>{project.category}</span>
                ) : null}
              </div>

              <div className={styles.badges}>
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
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

              <div className={styles.stats} aria-label={t.projects.stats}>
                <span
                  className={styles.stat}
                  title={t.projects.totalTime}
                  aria-label={`${t.projects.totalTime}: ${timeSpent}`}
                >
                  <FiClock size={13} aria-hidden />
                  <span>{timeSpent}</span>
                </span>
                <span
                  className={styles.stat}
                  title={t.projects.totalSpend}
                  aria-label={`${t.projects.totalSpend}: ${moneySpent}`}
                >
                  <FiDollarSign size={13} aria-hidden />
                  <span>{moneySpent}</span>
                </span>
                <span
                  className={styles.stat}
                  title={t.projects.files}
                  aria-label={`${t.projects.files}: ${project.fileCount}`}
                >
                  <FiPaperclip size={13} aria-hidden />
                  <span>{project.fileCount}</span>
                </span>
              </div>
            </Link>

            <div className={styles.meta}>
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
