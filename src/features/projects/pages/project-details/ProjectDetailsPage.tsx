import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import {
  FiArrowLeft,
  FiCheckSquare,
  FiDollarSign,
  FiUsers,
} from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import Title from "@primitive/title/Title.tsx";
import { Tabulator } from "@nav/tabulator/Tabulator.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { useProjects } from "../../store/projects.store.ts";
import styles from "./ProjectDetailsPage.module.scss";

const PROJECT_TABS = [
  { id: "overview", icon: AiOutlineDashboard },
  { id: "members", icon: FiUsers },
  { id: "tasks", icon: FiCheckSquare },
  { id: "finance", icon: FiDollarSign },
] as const;

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
          ariaLabel={t.projects.details.backToProjects}
        >
          <Button.Icon>
            <FiArrowLeft size={18} />
          </Button.Icon>
          <Button.Tooltip position="bottom">
            {t.projects.details.backToProjects}
          </Button.Tooltip>
        </Button>

        <Title text={project.name} />
      </header>

      <div className={styles.content}>
        <Tabulator defaultValue="overview">
          <Tabulator.Tabs>
            {PROJECT_TABS.map(({ id, icon: Icon }) => (
              <Tabulator.Tab key={id} value={id}>
                <Icon size={15} aria-hidden />
                {t.projects.details.tabs[id]}
              </Tabulator.Tab>
            ))}
          </Tabulator.Tabs>
          <Tabulator.Panels>
            {PROJECT_TABS.map(({ id }) => (
              <Tabulator.Panel key={id} value={id} />
            ))}
          </Tabulator.Panels>
        </Tabulator>
      </div>
    </div>
  );
}
