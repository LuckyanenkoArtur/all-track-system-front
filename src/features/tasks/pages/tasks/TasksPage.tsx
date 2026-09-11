import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCalendar, FiList } from "react-icons/fi";
import { BiAbacus, BiTable } from "react-icons/bi";
import { useUserProfile } from "../../../../context/UserProfileContext.tsx";
import { useTranslation } from "../../../../i18n/index.ts";

import { TaskFilterOptionsButton } from "../../components/buttons/task-filter-options/TaskFilterOptionsButton.tsx";
import { TaskCreationButton } from "../../components/buttons/task-creation-button/TaskCreationButton.tsx";
import { ViewSwitcher } from "@table/view-switcher/ViewSwitcher";

import { TaskDetailsDrawer } from "../../components/drawers/task-details-drawer/Drawer.tsx";
import { DrawerDismissContext } from "@overlay/drawer/Drawer";
import { useTasks } from "../../hooks/useTasks.ts";
import { useTaskTrackingDisplay } from "../../hooks/useTaskTrackingDisplay.ts";
import { useTaskListState } from "../../hooks/useTaskListState.ts";

import { TaskDataTable } from "../../components/data-tables/task-data-table/TaskDataTable.tsx";

import {
  DEFAULT_FILTERS,
  type TasksPageNavigationState,
} from "../../domain/others.ts";
import { getAuthorInitials } from "../../utils/commentUtils.ts";
import styles from "./TasksPage.module.scss";
import Title from "@primitive/title/Title.tsx";
import { SearchBar } from "@input/search-bar/SearchBar";
import { CompleteTaskDrawer } from "../../components/drawers/task-complete-drawer/Drawer.tsx";

export default function TaskPage() {
  const { t } = useTranslation();
  const { bio } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    tasks,
    addTask,
    isTracking,
    toggleTracking,
    completeTaskWithReport,
  } = useTasks();

  const { getDisplayTimeSpent } = useTaskTrackingDisplay();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsInitialTab, setDetailsInitialTab] = useState<string | undefined>();
  const [completeTaskId, setCompleteTaskId] = useState<string | null>(null);

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
  } = useTaskListState();

  const initiatorName =
    `${bio.firstName} ${bio.lastName}`.trim() || bio.username;
  const authorName = initiatorName;
  const authorInitials = getAuthorInitials(authorName);

  useEffect(() => {
    const navigationState = location.state as TasksPageNavigationState | null;
    if (!navigationState) return;

    if (navigationState.presetFilters) {
      setFilters({
        ...DEFAULT_FILTERS,
        ...navigationState.presetFilters,
      });
    }

    if (navigationState.selectedTaskId) {
      setSelectedTaskId(navigationState.selectedTaskId);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, setFilters]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const handleCompleteTask = (input: {
    description: string;
    steps: { id: string; text: string }[];
  }) => {
    if (!completeTaskId) return;

    completeTaskWithReport({
      taskId: completeTaskId,
      description: input.description,
      steps: input.steps,
      author: authorName,
      authorInitials,
    });
  };

  const taskViewSwitcherItems = useMemo(
    () => [
      { id: "table", label: t.tasks.tableView, icon: BiTable },
      { id: "kanban", label: "Kanban", icon: BiAbacus, disabled: true },
      {
        id: "calendar",
        label: "Calendar",
        icon: FiCalendar,
        disabled: true,
      },
      { id: "list", label: "List", icon: FiList, disabled: true },
    ],
    [t.tasks.tableView],
  );

  return (
    <DrawerDismissContext.Provider value={() => setSelectedTaskId(null)}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <Title text={t.sidebar.tasks} />
          <div className={styles.pageToolbar}>
            <div className={styles.toolbarSearch}>
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

            <ViewSwitcher value="table" items={taskViewSwitcherItems} />

            <TaskCreationButton
              onSubmit={addTask}
              initiatorName={initiatorName}
              filterOptions={filterOptions}
            />
          </div>
        </header>

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
          onTaskClick={(taskId) => {
            setDetailsInitialTab(undefined);
            setSelectedTaskId(taskId);
          }}
          onCompleteTask={setCompleteTaskId}
          onAddManualTime={(taskId) => {
            setDetailsInitialTab("time");
            setSelectedTaskId(taskId);
          }}
          onLogBudgetExpense={(taskId) => {
            setDetailsInitialTab("transactions");
            setSelectedTaskId(taskId);
          }}
          isTracking={isTracking}
          getDisplayTimeSpent={getDisplayTimeSpent}
          onToggleTracking={toggleTracking}
          labels={{
            allTasks: t.tasks.allTasks,
            noResults: t.tasks.noResults,
            taskDetails: t.tasks.taskDetails,
            status: t.tasks.status,
            priority: t.tasks.priority,
            groups: t.tasks.groups,
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

        <TaskDetailsDrawer task={selectedTask} initialTab={detailsInitialTab} />

        <CompleteTaskDrawer
          open={completeTaskId !== null}
          onClose={() => setCompleteTaskId(null)}
          onSubmit={handleCompleteTask}
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
    </DrawerDismissContext.Provider>
  );
}
