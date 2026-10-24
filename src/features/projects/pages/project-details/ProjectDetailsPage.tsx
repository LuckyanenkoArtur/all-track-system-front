import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { IoDocuments } from "react-icons/io5";
import {
  FiActivity,
  FiArrowLeft,
  FiCheckSquare,
  FiDollarSign,
} from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import ProgressBar from "@primitive/progress-bar/ProgressBar.tsx";
import Title from "@primitive/title/Title.tsx";
import { Tabulator } from "@nav/tabulator/Tabulator.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import {
  ProjectMembersPanel,
  ProjectOverviewPanel,
  ProjectPlaceholderPanel,
  ProjectTasksPanel,
  ProjectTransactionsPanel,
} from "../../components/project-details/ProjectDetailsPanels.tsx";
import { ProjectDetailsSidebar } from "../../components/project-details/ProjectDetailsSidebar.tsx";
import {
  PROJECT_DETAIL_TABS,
  type ProjectDetailTab,
} from "../../components/project-details/projectDetailTabs.ts";
import { useProjects } from "../../store/projects.store.ts";
import styles from "./ProjectDetailsPage.module.scss";

function isProjectTab(value: unknown): value is ProjectDetailTab {
  return (
    value === "members" ||
    PROJECT_DETAIL_TABS.includes(value as (typeof PROJECT_DETAIL_TABS)[number])
  );
}

const PROJECT_TABS = [
  { id: "overview", icon: AiOutlineDashboard },
  { id: "tasks", icon: FiCheckSquare },
  { id: "transactions", icon: FiDollarSign },
  { id: "documents", icon: IoDocuments },
  { id: "activities", icon: FiActivity },
] as const;

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const projects = useProjects();
  const project = projects.find((item) => item.id === id) ?? null;
  const requestedTab = (location.state as { tab?: unknown } | null)?.tab;
  const [tab, setTab] = useState<ProjectDetailTab>(
    isProjectTab(requestedTab) ? requestedTab : "overview",
  );

  useEffect(() => {
    setTab(isProjectTab(requestedTab) ? requestedTab : "overview");
  }, [id, requestedTab]);

  if (!project) {
    return <Navigate to="/404" replace />;
  }

  const progressPercent =
    project.totalTasks === 0
      ? 0
      : Math.round((project.completedTasks / project.totalTasks) * 100);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.identity}>
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

          <Title text={project.name} className={styles.projectTitle} title={project.name} />
        </div>

        <div
          className={styles.statusPanel}
          aria-label={`${t.projects.details.projectProgress}, ${progressPercent}%`}
        >
          <div className={styles.progressHead}>
            <span className={styles.statusTitle}>
              {t.projects.details.projectProgress}
            </span>
            <span className={styles.percent}>{progressPercent}%</span>
          </div>
          <ProgressBar
            completed={project.completedTasks}
            total={project.totalTasks}
          >
            <ProgressBar.Body />
          </ProgressBar>
        </div>
      </header>

      <div className={styles.workspace}>
        <div className={styles.main}>
          <Tabulator
            defaultValue="overview"
            value={tab}
            onValueChange={(next) => setTab(next as ProjectDetailTab)}
          >
            <Tabulator.Tabs>
              {PROJECT_TABS.map(({ id: tabId, icon: Icon }) => (
                <Tabulator.Tab key={tabId} value={tabId}>
                  <Icon size={15} aria-hidden />
                  {t.projects.details.tabs[tabId]}
                </Tabulator.Tab>
              ))}
            </Tabulator.Tabs>
            <Tabulator.Panels>
              <Tabulator.Panel value="overview">
                <div className={styles.panelScroll}>
                  <ProjectOverviewPanel project={project} onOpenTab={setTab} />
                </div>
              </Tabulator.Panel>
              <Tabulator.Panel value="members">
                <div className={styles.panelScroll}>
                  <ProjectMembersPanel project={project} />
                </div>
              </Tabulator.Panel>
              <Tabulator.Panel value="tasks">
                <ProjectTasksPanel project={project} />
              </Tabulator.Panel>
              <Tabulator.Panel value="activities">
                <div className={styles.panelScroll}>
                  <ProjectPlaceholderPanel
                    icon={<FiActivity size={22} aria-hidden />}
                    title={t.projects.details.tabs.activities}
                    message={t.projects.details.activitiesEmpty}
                  />
                </div>
              </Tabulator.Panel>
              <Tabulator.Panel value="documents">
                <div className={styles.panelScroll}>
                  <ProjectPlaceholderPanel
                    icon={<IoDocuments size={22} aria-hidden />}
                    title={t.projects.details.tabs.documents}
                    message={t.projects.details.documentsEmpty}
                  />
                </div>
              </Tabulator.Panel>
              <Tabulator.Panel value="transactions">
                <div className={styles.panelScroll}>
                  <ProjectTransactionsPanel project={project} />
                </div>
              </Tabulator.Panel>
            </Tabulator.Panels>
          </Tabulator>
        </div>

        <ProjectDetailsSidebar project={project} onOpenTab={setTab} />
      </div>
    </div>
  );
}
