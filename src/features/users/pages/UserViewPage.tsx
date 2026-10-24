import { Link, Navigate, useParams } from "react-router-dom";

import { Card } from "@layout/card/Card.tsx";
import Title from "@primitive/title/Title.tsx";
import { useTranslation } from "../../../i18n/index.ts";
import { useProjects } from "../../projects/store/projects.store.ts";
import styles from "./UserViewPage.module.scss";

export function UserViewPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const projects = useProjects();
  const member = projects
    .flatMap((project) => project.members)
    .find((item) => item.id === id);
  const memberProjects = projects.filter((project) =>
    project.members.some((item) => item.id === id),
  );

  if (!member) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Title text={member.name} title={member.name} />
      </header>

      <Card className={styles.card}>
        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>{t.users.role}</dt>
            <dd>{member.role}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>{t.users.projects}</dt>
            <dd>
              <ul className={styles.projects}>
                {memberProjects.map((project) => (
                  <li key={project.id}>
                    <Link to={`/app/projects/${project.id}`}>{project.name}</Link>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
