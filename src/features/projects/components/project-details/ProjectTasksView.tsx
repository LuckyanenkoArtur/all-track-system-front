import { useMemo, useState } from "react";
import { BiAbacus, BiTable } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import { SearchBar } from "@input/search-bar/SearchBar";
import { ViewSwitcher } from "@table/view-switcher/ViewSwitcher";
import { useUserProfile } from "../../../../context/UserProfileContext.tsx";
import { useTranslation } from "../../../../i18n/index.ts";
import { TaskFilterOptionsButton } from "../../../tasks/components/buttons/task-filter-options/TaskFilterOptionsButton.tsx";
import { TaskDataTable } from "../../../tasks/components/data-tables/task-data-table/TaskDataTable.tsx";
import { CompleteTaskDrawer } from "../../../tasks/components/drawers/task-complete-drawer/Drawer.tsx";
import { TaskKanbanBoard } from "../../../tasks/components/kanban/TaskKanbanBoard.tsx";
import type { TaskStatus } from "../../../tasks/domain/others.ts";
import { useTaskListState } from "../../../tasks/hooks/useTaskListState.ts";
import { useTaskTrackingDisplay } from "../../../tasks/hooks/useTaskTrackingDisplay.ts";
import { useTasks } from "../../../tasks/hooks/useTasks.ts";
import { getAuthorInitials } from "../../../tasks/utils/commentUtils.ts";
import {
  matchesFilters,
  matchesSearch,
  sortTasks,
} from "../../../tasks/utils/taskListUtils.ts";
import type { Project } from "../../domain/project.ts";
import { projectTaskDetailsPath } from "./projectTaskPaths.ts";
import styles from "./ProjectTasksView.module.scss";

type TasksView = "table" | "kanban";

export function ProjectTasksView({ project }: { project: Project }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bio } = useUserProfile();
  const {
    tasks,
    isTracking,
    toggleTracking,
    completeTaskWithReport,
    updateTaskStatus,
    getTaskComments,
  } = useTasks();
  const { getDisplayTimeSpent } = useTaskTrackingDisplay();

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project === project.id),
    [tasks, project.id],
  );

  const {
    filters,
    draftFilters,
    setFilters,
    setDraftFilters,
    sort,
    toggleSort,
    pageSize,
    setPageSize,
    setPage,
    filtersOpen,
    openFilters,
    closeFilters,
    applyFilters,
    resetDraftFilters,
    collections,
    activeCollectionId,
    applyCollection,
    resetFilters,
    handleSaveCollection,
    deleteCollection,
    filterOptions,
    listResult,
    activeFilterCount,
  } = useTaskListState(projectTasks);

  const [view, setView] = useState<TasksView>("table");
  const [completeTaskId, setCompleteTaskId] = useState<string | null>(null);

  const authorName = `${bio.firstName} ${bio.lastName}`.trim() || bio.username;
  const authorInitials = getAuthorInitials(authorName);

  const kanbanTasks = useMemo(
    () =>
      sortTasks(
        projectTasks.filter(
          (task) =>
            matchesSearch(task, filters.search) && matchesFilters(task, filters),
        ),
        sort,
      ),
    [projectTasks, filters, sort],
  );

  const taskViewSwitcherItems = useMemo(
    () => [
      { id: "table", label: t.tasks.tableView, icon: BiTable },
      { id: "kanban", label: t.tasks.kanbanView, icon: BiAbacus },
    ],
    [t.tasks.tableView, t.tasks.kanbanView],
  );

  const openTask = (taskId: string, detailsTab?: string) => {
    navigate(projectTaskDetailsPath(project.id, taskId), {
      state: detailsTab ? { detailsTab } : undefined,
    });
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status, {
      author: authorName,
      authorInitials,
    });
  };

  return (
      <div className={styles.tasksPanel}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <SearchBar
              value={filters.search}
              onChange={(search) => setFilters({ ...filters, search })}
              placeholder={t.tasks.searchPlaceholder}
              ariaLabel={t.tasks.searchPlaceholder}
            />
          </div>
          <TaskFilterOptionsButton
            open={filtersOpen}
            activeFilterCount={activeFilterCount}
            filters={filters}
            draftFilters={draftFilters}
            filterOptions={filterOptions}
            onOpen={openFilters}
            onClose={closeFilters}
            onChange={setDraftFilters}
            onApply={applyFilters}
            onReset={resetDraftFilters}
            onSaveCollection={(name) =>
              handleSaveCollection(
                name,
                { ...draftFilters, search: filters.search },
                false,
              )
            }
          />
          <ViewSwitcher
            value={view}
            items={taskViewSwitcherItems}
            onChange={(id) => {
              if (id === "table" || id === "kanban") setView(id);
            }}
          />
        </div>

        {view === "table" ? (
          <div className={styles.view}>
            <TaskDataTable
              collections={collections}
              tasks={listResult.tasks}
              activeCollectionId={activeCollectionId}
              onSelectAll={resetFilters}
              onSelectCollection={applyCollection}
              onDeleteCollection={deleteCollection}
              listResult={{
                page: listResult.page,
                totalPages: listResult.totalPages,
                total: listResult.total,
                startIndex: listResult.startIndex,
                endIndex: listResult.endIndex,
              }}
              sort={sort}
              onSort={toggleSort}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onTaskClick={(taskId) => openTask(taskId)}
              onCompleteTask={setCompleteTaskId}
              onAddManualTime={(taskId) => openTask(taskId, "time")}
              onLogBudgetExpense={(taskId) => openTask(taskId, "transactions")}
              isTracking={isTracking}
              getDisplayTimeSpent={getDisplayTimeSpent}
              onToggleTracking={toggleTracking}
              labels={{
                allTasks: t.tasks.allTasks,
                noResults: t.tasks.noResults,
                taskDetails: t.tasks.taskDetails,
                status: t.tasks.status,
                priority: t.tasks.priority,
                categories: t.tasks.categories,
                project: t.tasks.project,
                createdAt: t.tasks.createdAt,
                dueDate: t.tasks.dueDate,
                initiator: t.tasks.initiator,
                responsible: t.tasks.responsible,
                observables: t.tasks.observables,
                budget: t.tasks.budget,
                totalTime: t.tasks.totalTime,
                actions: t.tasks.actions,
                startTracking: t.tasks.startTracking,
                stopTracking: t.tasks.stopTracking,
                finishTracking: t.tasks.finishTracking,
                completeTask: t.tasks.completeTask,
                addManualTime: t.tasks.addManualTime,
                logBudgetExpense: t.tasks.logBudgetExpense,
                showing: t.tasks.showing,
                rowsPerPage: t.tasks.rowsPerPage,
                page: t.tasks.page,
                of: t.tasks.of,
                previous: t.tasks.previous,
                next: t.tasks.next,
              }}
            />
          </div>
        ) : null}

        {view === "kanban" ? (
          <div className={styles.view}>
            {kanbanTasks.length === 0 ? (
              <p className={styles.empty}>{t.tasks.noResults}</p>
            ) : (
              <TaskKanbanBoard
                tasks={kanbanTasks}
                getCommentCount={(taskId) => getTaskComments(taskId).length}
                onTaskClick={(taskId) => openTask(taskId)}
                onStatusChange={handleStatusChange}
                onCompleteTask={setCompleteTaskId}
                onAddManualTime={(taskId) => openTask(taskId, "time")}
                onLogBudgetExpense={(taskId) => openTask(taskId, "transactions")}
                isTracking={isTracking}
                onToggleTracking={toggleTracking}
              />
            )}
          </div>
        ) : null}

        <CompleteTaskDrawer
          open={completeTaskId !== null}
          onClose={() => setCompleteTaskId(null)}
          onSubmit={(input) => {
            if (!completeTaskId) return;
            completeTaskWithReport({
              taskId: completeTaskId,
              description: input.description,
              steps: input.steps,
              author: authorName,
              authorInitials,
            });
          }}
          labels={{
            title: t.tasks.details.completeDialogTitle,
            subtitle: t.tasks.details.completeDialogSubtitle,
            description: t.tasks.details.completionDescription,
            descriptionPlaceholder:
              t.tasks.details.completionDescriptionPlaceholder,
            required: t.tasks.dashboard.required,
            steps: t.tasks.details.completionSteps,
            addStep: t.tasks.dashboard.addStep,
            stepPlaceholder: t.tasks.dashboard.stepPlaceholder,
            removeStep: t.tasks.dashboard.removeStep,
            apply: t.tasks.details.completeApply,
            cancel: t.common.cancel,
          }}
        />
      </div>
  );
}
