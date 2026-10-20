import { useMemo, useState } from "react";
import { BiAbacus, BiTable } from "react-icons/bi";
import { FiFilter, FiGrid, FiList, FiPlus } from "react-icons/fi";

import { Button } from "@primitive/button/Button.tsx";
import Title from "@primitive/title/Title.tsx";
import { SearchBar } from "@input/search-bar/SearchBar.tsx";
import { DataTablePagination } from "@table/data-table/pagination/DataTablePagination.tsx";
import { ViewSwitcher } from "@table/view-switcher/ViewSwitcher.tsx";
import { useTranslation } from "../../i18n/index.ts";
import { ProjectCard } from "./components/project-card/ProjectCard.tsx";
import { ProjectCreationDrawer } from "./components/project-creation-drawer/ProjectCreationDrawer.tsx";
import { ProjectDataTable } from "./components/project-data-table/ProjectDataTable.tsx";
import { ProjectFilterDrawer } from "./components/project-filter-drawer/ProjectFilterDrawer.tsx";
import { ProjectKanbanBoard } from "./components/project-kanban/ProjectKanbanBoard.tsx";
import { ProjectListView } from "./components/project-list/ProjectListView.tsx";
import {
  EMPTY_PROJECT_FILTERS,
  countActiveProjectFilters,
  type Project,
  type ProjectFilters,
} from "./domain/project.ts";
import { addProject, useProjects } from "./store/projects.store.ts";
import styles from "./ProjectsPage.module.scss";

const PAGE_SIZE_OPTIONS = [6, 12, 18];
type ProjectsView = "cards" | "list" | "kanban" | "table";

function isoDateDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ProjectsPage() {
  const { t } = useTranslation();
  const projects = useProjects();
  const [view, setView] = useState<ProjectsView>("cards");
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<ProjectFilters>(EMPTY_PROJECT_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<ProjectFilters>(EMPTY_PROJECT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        query.length === 0 ||
        project.name.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);
      const matchesStatus =
        appliedFilters.status === null ||
        project.status === appliedFilters.status;
      const matchesPriority =
        appliedFilters.priority === null ||
        project.priority === appliedFilters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [appliedFilters.priority, appliedFilters.status, projects, search]);

  const total = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const visibleProjects = filteredProjects.slice(startIndex, endIndex);

  const viewSwitcherItems = useMemo(
    () => [
      { id: "cards", label: t.projects.cardsView, icon: FiGrid },
      { id: "list", label: t.projects.listView, icon: FiList },
      { id: "kanban", label: t.projects.kanbanView, icon: BiAbacus },
      { id: "table", label: t.projects.tableView, icon: BiTable },
    ],
    [
      t.projects.cardsView,
      t.projects.listView,
      t.projects.kanbanView,
      t.projects.tableView,
    ],
  );

  const openFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(true);
  };

  const paginationLabels = {
    showing: t.tasks.showing,
    rowsPerPage: t.tasks.rowsPerPage,
    page: t.tasks.page,
    of: t.tasks.of,
    previous: t.tasks.previous,
    next: t.tasks.next,
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Title text={t.sidebar.projects} />
        <div className={styles.pageToolbar}>
          <div className={styles.toolbarSearch}>
            <SearchBar
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder={t.projects.searchPlaceholder}
              ariaLabel={t.projects.searchPlaceholder}
            />
          </div>

          <Button
            className={styles.filterButton}
            onClick={() => (filtersOpen ? setFiltersOpen(false) : openFilters())}
            active={filtersOpen}
            ariaExpanded={filtersOpen}
          >
            <Button.Icon>
              <FiFilter size={16} />
            </Button.Icon>
            <Button.Text>{t.tasks.filters}</Button.Text>
            <Button.Badge>{countActiveProjectFilters(appliedFilters)}</Button.Badge>
          </Button>

          <ViewSwitcher
            value={view}
            items={viewSwitcherItems}
            onChange={(id) => {
              if (
                id === "cards" ||
                id === "list" ||
                id === "kanban" ||
                id === "table"
              ) {
                setView(id);
                setPage(1);
              }
            }}
          />

          <Button onClick={() => setCreateOpen(true)}>
            <Button.Icon>
              <FiPlus size={16} />
            </Button.Icon>
            <Button.Text>{t.projects.newProject}</Button.Text>
            <Button.Tooltip position="bottom">
              {t.projects.newProjectHint}
            </Button.Tooltip>
          </Button>
        </div>
      </header>

      {view === "cards" || view === "list" ? (
        <div className={styles.panel}>
          {visibleProjects.length === 0 ? (
            <p className={styles.empty}>{t.projects.noResults}</p>
          ) : view === "cards" ? (
            <div className={styles.grid}>
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <ProjectListView projects={visibleProjects} />
          )}

          <DataTablePagination
            page={currentPage}
            totalPages={totalPages}
            total={total}
            startIndex={startIndex}
            endIndex={endIndex}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            labels={paginationLabels}
          />
        </div>
      ) : null}

      {view === "kanban" ? (
        filteredProjects.length === 0 ? (
          <p className={styles.empty}>{t.projects.noResults}</p>
        ) : (
          <ProjectKanbanBoard projects={filteredProjects} />
        )
      ) : null}

      {view === "table" ? (
        <div className={styles.tableView}>
          <ProjectDataTable
            projects={visibleProjects}
            page={currentPage}
            totalPages={totalPages}
            total={total}
            startIndex={startIndex}
            endIndex={endIndex}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      ) : null}

      <ProjectFilterDrawer
        open={filtersOpen}
        draft={draftFilters}
        applied={appliedFilters}
        onChange={setDraftFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
          setFiltersOpen(false);
        }}
        onReset={() => setDraftFilters(EMPTY_PROJECT_FILTERS)}
      />

      <ProjectCreationDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(input) => {
          const project: Project = {
            id: `PRJ-${crypto.randomUUID()}`,
            name: input.name,
            category: "",
            status: input.status,
            priority: input.priority,
            completedTasks: 0,
            totalTasks: 0,
            fileCount: 0,
            timeSpentMinutes: 0,
            moneySpent: 0,
            members: [],
            dueDate: isoDateDaysFromNow(30),
          };
          addProject(project);
          setPage(1);
        }}
      />
    </div>
  );
}
