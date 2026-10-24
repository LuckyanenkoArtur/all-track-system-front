import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "@layout/card/Card.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { useTasks } from "../../../tasks/hooks/useTasks.ts";
import { TaskDetailsTabPlaceholder } from "../../../tasks/components/placeholders/TaskDetailsTabPlaceholder.tsx";
import {
  formatProjectMoneySpent,
  type Project,
} from "../../domain/project.ts";
import { ProjectMemberList } from "./ProjectDetailsSidebar.tsx";
import { ProjectEventsCard } from "./ProjectEventsCard.tsx";
import {
  ProjectFinanceSummaries,
  ProjectOverviewTemplates,
  ProjectRecentActivity,
  ProjectTaskSummary,
} from "./ProjectOverviewTemplates.tsx";
import type { ProjectDetailTab } from "./projectDetailTabs.ts";
import { projectTaskDetailsPath } from "./projectTaskPaths.ts";
import { ProjectTasksView } from "./ProjectTasksView.tsx";
import styles from "./ProjectDetailsPanels.module.scss";

type ProjectPanelProps = {
  project: Project;
};

function useProjectTasks(projectId: string) {
  const { tasks } = useTasks();

  return useMemo(
    () =>
      tasks
        .filter((task) => task.project === projectId)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks, projectId],
  );
}

export function ProjectOverviewPanel({
  project,
  onOpenTab,
}: ProjectPanelProps & { onOpenTab?: (tab: ProjectDetailTab) => void }) {
  return (
    <div className={styles.panel}>
      <ProjectTaskSummary />
      <ProjectFinanceSummaries />
      <div className={styles.spotlight}>
        <ProjectRecentActivity />
        <ProjectEventsCard project={project} />
      </div>
      <ProjectOverviewTemplates onOpenTab={onOpenTab} />
    </div>
  );
}

export function ProjectMembersPanel({ project }: ProjectPanelProps) {
  return (
    <div className={styles.panel}>
      <ProjectMemberList members={project.members} />
    </div>
  );
}

export function ProjectPlaceholderPanel({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className={styles.panel}>
      <TaskDetailsTabPlaceholder icon={icon} title={title} message={message} />
    </div>
  );
}

export function ProjectTasksPanel({ project }: ProjectPanelProps) {
  return <ProjectTasksView project={project} />;
}

export function ProjectTransactionsPanel({ project }: ProjectPanelProps) {
  const { t, language } = useTranslation();
  const tasks = useProjectTasks(project.id);
  const moneySpent = formatProjectMoneySpent(project.moneySpent, language);

  return (
    <div className={styles.panel}>
      <Card className={styles.spendCard}>
        <Card.Content>
          <span className={styles.spendValue}>{moneySpent}</span>
        </Card.Content>
        <Card.Title>{t.projects.totalSpend}</Card.Title>
      </Card>

      <section className={styles.section} aria-label={t.tasks.budget}>
        <h2 className={styles.sectionTitle}>{t.tasks.budget}</h2>
        {tasks.length === 0 ? (
          <p className={styles.empty}>{t.projects.details.noTasks}</p>
        ) : (
          <ul className={styles.budgetList}>
            {tasks.map((task) => (
              <li key={task.id}>
                <Link
                  to={projectTaskDetailsPath(project.id, task.id)}
                  className={styles.budgetRow}
                >
                  <span className={styles.taskTitle} title={task.title}>
                    {task.title}
                  </span>
                  <span className={styles.budgetValue}>{task.budget || "—"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
