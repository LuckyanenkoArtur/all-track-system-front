import { FiUserPlus } from "react-icons/fi";

import { useMemo } from "react";

import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { Button } from "@primitive/button/Button.tsx";
import { Card } from "@layout/card/Card.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { useTasks } from "../../../tasks/hooks/useTasks.ts";
import { parseBudget } from "../../../tasks/utils/taskListUtils.ts";
import {
  formatProjectMoneySpent,
  formatProjectTimeSpent,
  type Project,
  type ProjectMember,
} from "../../domain/project.ts";
import type { ProjectDetailTab } from "./projectDetailTabs.ts";
import styles from "./ProjectDetailsSidebar.module.scss";

type ProjectDetailsSidebarProps = {
  project: Project;
  onOpenTab: (tab: ProjectDetailTab) => void;
};

function formatDueDate(isoDate: string, language: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  return new Date(year, month - 1, day).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric" },
  );
}

function ViewAllButton({
  label,
  section,
  onClick,
}: {
  label: string;
  section: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.viewAll}
      aria-label={`${label}, ${section}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ProjectMemberList({ members }: { members: ProjectMember[] }) {
  const { t } = useTranslation();

  if (members.length === 0) {
    return <p className={styles.empty}>{t.projects.details.noMembers}</p>;
  }

  return (
    <ul className={styles.memberList} aria-label={t.projects.members}>
      {members.map((member) => (
        <li key={member.id} className={styles.member}>
          <FeedItem.Avatar className={styles.memberAvatar}>
            {member.initials}
          </FeedItem.Avatar>
          <div className={styles.memberCopy}>
            <span className={styles.memberName}>{member.name}</span>
            <span className={styles.memberRole}>{member.role}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProjectDetailsSidebar({
  project,
  onOpenTab,
}: ProjectDetailsSidebarProps) {
  const { t, language } = useTranslation();
  const { tasks } = useTasks();
  const startDate = formatDueDate(project.startDate, language);
  const endDate = formatDueDate(project.dueDate, language);
  const responsible = project.members[0] ?? null;
  const budget = useMemo(
    () =>
      tasks
        .filter((task) => task.project === project.id)
        .reduce((sum, task) => sum + parseBudget(task.budget), 0),
    [tasks, project.id],
  );

  return (
    <aside className={styles.sidebar} aria-label={t.projects.details.sidebar}>
      <Card className={styles.card}>
        <div className={`${styles.cardHead} ${styles.cardHeadCenter}`}>
          <div className={styles.scheduleDate}>
            <span className={styles.dateLabel}>{t.tasks.details.startDate}</span>
            <time className={styles.dateValue} dateTime={project.startDate}>
              {startDate}
            </time>
          </div>
          <div className={`${styles.scheduleDate} ${styles.scheduleDateEnd}`}>
            <span className={styles.dateLabel}>{t.projects.details.endDate}</span>
            <time className={styles.dateValue} dateTime={project.dueDate}>
              {endDate}
            </time>
          </div>
        </div>

        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>{t.projects.details.lead}</dt>
            <dd>
              {responsible ? (
                <span className={styles.responsible}>
                  <FeedItem.Avatar className={styles.responsibleAvatar}>
                    {responsible.initials}
                  </FeedItem.Avatar>
                  <span className={styles.responsibleName}>
                    {responsible.name}
                  </span>
                </span>
              ) : (
                <span className={styles.muted}>—</span>
              )}
            </dd>
          </div>
          <div className={styles.metaRow}>
            <dt>{t.projects.category}</dt>
            <dd>{project.category || "—"}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>{t.tasks.budget}</dt>
            <dd>{budget > 0 ? formatProjectMoneySpent(budget, language) : "—"}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>{t.projects.totalTime}</dt>
            <dd>{formatProjectTimeSpent(project.timeSpentMinutes, language)}</dd>
          </div>
        </dl>
      </Card>

      <Card className={styles.card}>
        <div className={`${styles.cardHead} ${styles.cardHeadCenter}`}>
          <h2 className={styles.sectionTitle}>{t.projects.members}</h2>
          <Button onClick={() => undefined}>
            <Button.Icon>
              <FiUserPlus size={16} />
            </Button.Icon>
            <Button.Text>{t.projects.details.invite}</Button.Text>
          </Button>
        </div>
        <ProjectMemberList members={project.members} />
        <div className={styles.cardFooter}>
          <ViewAllButton
            label={t.projects.details.viewAll}
            section={t.projects.members}
            onClick={() => onOpenTab("members")}
          />
        </div>
      </Card>
    </aside>
  );
}
