import { useNavigate } from "react-router-dom";

import { DataTable } from "@table/data-table";
import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import PriorityBadge from "../../../tasks/components/badges/priority-badge/PriorityBadge.tsx";
import StatusBadge from "../../../tasks/components/badges/status-badge/StatusBadge.tsx";
import {
  formatProjectMoneySpent,
  formatProjectTimeSpent,
  type Project,
} from "../../domain/project.ts";
import styles from "./ProjectDataTable.module.scss";

const PAGE_SIZE_OPTIONS = [6, 12, 18];
const VISIBLE_MEMBERS = 3;

type ProjectDataTableProps = {
  projects: Project[];
  page: number;
  totalPages: number;
  total: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

function formatDueDate(isoDate: string, language: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  return new Date(year, month - 1, day).toLocaleDateString(
    language === "ru" ? "ru-RU" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
}

export function ProjectDataTable({
  projects,
  page,
  totalPages,
  total,
  startIndex,
  endIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProjectDataTableProps) {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  return (
    <DataTable
      value={projects}
      emptyLabel={t.projects.noResults}
      onRowClick={(project) => navigate(`/app/projects/${project.id}`)}
      getRowKey={(project) => project.id}
      getRowAriaLabel={(project) => project.name}
    >
      <DataTable.Column
        field="name"
        header={t.projects.projectName}
        body={(row) => {
          const project = row as Project;
          return (
            <div className={styles.nameCell}>
              <span className={styles.name}>{project.name}</span>
              {project.category ? (
                <span className={styles.category}>{project.category}</span>
              ) : null}
            </div>
          );
        }}
      />
      <DataTable.Column
        field="status"
        header={t.tasks.status}
        body={(row) => <StatusBadge status={(row as Project).status} />}
      />
      <DataTable.Column
        field="priority"
        header={t.tasks.priority}
        body={(row) => <PriorityBadge priority={(row as Project).priority} />}
      />
      <DataTable.Column
        field="progress"
        header={t.projects.progress}
        body={(row) => {
          const project = row as Project;
          const percent =
            project.totalTasks === 0
              ? 0
              : Math.round((project.completedTasks / project.totalTasks) * 100);
          return (
            <span className={styles.numeric}>
              {project.completedTasks}/{project.totalTasks} ({percent}%)
            </span>
          );
        }}
      />
      <DataTable.Column
        field="timeSpentMinutes"
        header={t.projects.totalTime}
        body={(row) => (
          <span className={styles.numeric}>
            {formatProjectTimeSpent((row as Project).timeSpentMinutes, language)}
          </span>
        )}
      />
      <DataTable.Column
        field="moneySpent"
        header={t.projects.totalSpend}
        body={(row) => (
          <span className={styles.numeric}>
            {formatProjectMoneySpent((row as Project).moneySpent, language)}
          </span>
        )}
      />
      <DataTable.Column
        field="fileCount"
        header={t.projects.files}
        body={(row) => (
          <span className={styles.numeric}>{(row as Project).fileCount}</span>
        )}
      />
      <DataTable.Column
        field="dueDate"
        header={t.projects.due}
        body={(row) => formatDueDate((row as Project).dueDate, language)}
      />
      <DataTable.Column
        field="members"
        header={t.projects.members}
        body={(row) => {
          const project = row as Project;
          if (project.members.length === 0) {
            return <span className={styles.emptyCell}>—</span>;
          }

          const visible = project.members.slice(0, VISIBLE_MEMBERS);
          const hidden = project.members.length - visible.length;

          return (
            <div className={styles.members} role="group" aria-label={t.projects.members}>
              {visible.map((person) => (
                <FeedItem.Avatar key={person.id} className={styles.member}>
                  {person.initials}
                </FeedItem.Avatar>
              ))}
              {hidden > 0 ? (
                <span className={styles.memberOverflow}>+{hidden}</span>
              ) : null}
            </div>
          );
        }}
      />

      <DataTable.Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        startIndex={startIndex}
        endIndex={endIndex}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        labels={{
          showing: t.tasks.showing,
          rowsPerPage: t.tasks.rowsPerPage,
          page: t.tasks.page,
          of: t.tasks.of,
          previous: t.tasks.previous,
          next: t.tasks.next,
        }}
      />
    </DataTable>
  );
}
