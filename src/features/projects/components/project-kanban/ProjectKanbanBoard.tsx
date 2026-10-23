import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiPauseCircle,
  FiPlayCircle,
  FiXCircle,
} from "react-icons/fi";

import { useTranslation } from "../../../../i18n/index.ts";
import { TASK_STATUS_IDS } from "../../../tasks/utils/taskStatusUtils.ts";
import type { Project, ProjectStatus } from "../../domain/project.ts";
import { updateProjectStatus } from "../../store/projects.store.ts";
import { ProjectKanbanCard } from "./ProjectKanbanCard.tsx";
import styles from "./ProjectKanbanBoard.module.scss";

const COLUMN_CHROME: Record<
  ProjectStatus,
  { icon: ReactNode; headerClass: string }
> = {
  open: {
    icon: <FiClock size={15} aria-hidden />,
    headerClass: styles.openHeader,
  },
  onHold: {
    icon: <FiPauseCircle size={15} aria-hidden />,
    headerClass: styles.onHoldHeader,
  },
  inProgress: {
    icon: <FiPlayCircle size={15} aria-hidden />,
    headerClass: styles.inProgressHeader,
  },
  completed: {
    icon: <FiCheckCircle size={15} aria-hidden />,
    headerClass: styles.completedHeader,
  },
  cancelled: {
    icon: <FiXCircle size={15} aria-hidden />,
    headerClass: styles.cancelledHeader,
  },
};

const PROJECT_DRAG_MIME = "application/x-alltrack-project-id";

type ProjectKanbanBoardProps = {
  projects: Project[];
};

export function ProjectKanbanBoard({ projects }: ProjectKanbanBoardProps) {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState<ProjectStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const byStatus = Object.fromEntries(
      TASK_STATUS_IDS.map((status) => [status, [] as Project[]]),
    ) as Record<ProjectStatus, Project[]>;

    for (const project of projects) {
      byStatus[project.status]?.push(project);
    }

    return TASK_STATUS_IDS.map((status) => ({
      status,
      label: t.tasks[status],
      projects: byStatus[status],
    }));
  }, [projects, t.tasks]);

  const handleDragStart = (event: DragEvent, projectId: string) => {
    event.dataTransfer.setData(PROJECT_DRAG_MIME, projectId);
    event.dataTransfer.setData("text/plain", projectId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(projectId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setActiveStatus(null);
  };

  const handleDragOver = (event: DragEvent, status: ProjectStatus) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (activeStatus !== status) setActiveStatus(status);
  };

  const handleDragLeave = (event: DragEvent, status: ProjectStatus) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    if (activeStatus === status) setActiveStatus(null);
  };

  const handleDrop = (event: DragEvent, status: ProjectStatus) => {
    event.preventDefault();
    const projectId =
      event.dataTransfer.getData(PROJECT_DRAG_MIME) ||
      event.dataTransfer.getData("text/plain");
    if (projectId) updateProjectStatus(projectId, status);
    setDraggingId(null);
    setActiveStatus(null);
  };

  return (
    <div className={styles.board} role="list" aria-label={t.projects.kanbanView}>
      {columns.map((column) => (
        <section
          key={column.status}
          className={`${styles.column} ${
            activeStatus === column.status ? styles.columnActive : ""
          }`}
          role="list"
          aria-label={column.label}
          onDragOver={(event) => handleDragOver(event, column.status)}
          onDragLeave={(event) => handleDragLeave(event, column.status)}
          onDrop={(event) => handleDrop(event, column.status)}
        >
          <header
            className={`${styles.columnHeader} ${COLUMN_CHROME[column.status].headerClass}`}
          >
            <div className={styles.columnTitleGroup}>
              <span className={styles.columnIcon}>
                {COLUMN_CHROME[column.status].icon}
              </span>
              <h3 className={styles.columnTitle}>{column.label}</h3>
            </div>
            <span className={styles.columnCount}>{column.projects.length}</span>
          </header>

          <div className={styles.columnBody}>
            {column.projects.length === 0 ? (
              <p className={styles.columnEmpty}>{t.projects.kanbanEmpty}</p>
            ) : (
              column.projects.map((project) => (
                <div
                  key={project.id}
                  className={styles.cardSlot}
                  role="listitem"
                  draggable
                  onDragStart={(event) => handleDragStart(event, project.id)}
                  onDragEnd={handleDragEnd}
                >
                  <ProjectKanbanCard
                    project={project}
                    dragging={draggingId === project.id}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
