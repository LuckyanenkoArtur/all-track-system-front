import Title from "@primitive/title/Title.tsx";
import { Card } from "@layout/card/Card.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { summarizeProjects, type Project } from "../../domain/project.ts";
import styles from "./ProjectSummaryCards.module.scss";

type ProjectSummaryCardsProps = {
  projects: Project[];
};

export function ProjectSummaryCards({ projects }: ProjectSummaryCardsProps) {
  const { t } = useTranslation();
  const summary = summarizeProjects(projects);

  const items = [
    { id: "active", label: t.projects.summary.active, value: summary.active },
    {
      id: "inProgress",
      label: t.projects.summary.inProgress,
      value: summary.inProgress,
    },
    {
      id: "completed",
      label: t.projects.summary.completed,
      value: summary.completed,
    },
    { id: "atRisk", label: t.projects.summary.atRisk, value: summary.atRisk },
  ];

  return (
    <section className={styles.root} aria-label={t.projects.tabs.summary}>
      {items.map((item) => (
        <Card key={item.id} className={styles.card}>
          <Card.Content>
            <Title as="h2" text={String(item.value)} className={styles.value} />
          </Card.Content>
          <Card.Title>{item.label}</Card.Title>
        </Card>
      ))}
    </section>
  );
}
