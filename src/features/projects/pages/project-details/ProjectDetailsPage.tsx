import { Navigate, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import Title from "@primitive/title/Title.tsx";
import PriorityBadge from "../../../tasks/components/badges/priority-badge/PriorityBadge.tsx";
import StatusBadge from "../../../tasks/components/badges/status-badge/StatusBadge.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { useProjects } from "../../store/projects.store.ts";
import styles from "./ProjectDetailsPage.module.scss";

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const projects = useProjects();
  const project = projects.find((item) => item.id === id) ?? null;

  if (!project) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Button
          onClick={() => navigate("/app/projects")}
          className={styles.backButton}
        >
          <Button.Icon>
            <FiArrowLeft size={18} />
          </Button.Icon>
          <Button.Text>{t.projects.details.backToProjects}</Button.Text>
        </Button>
      </header>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <Title text={project.name} />
          <div className={styles.badges}>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
        </div>
        <p className={styles.placeholder}>{t.projects.details.placeholder}</p>
      </div>
    </div>
  );
}
