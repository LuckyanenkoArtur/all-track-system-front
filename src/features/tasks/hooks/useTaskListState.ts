import { useCallback, useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import type { TaskFilters } from "../domain/filters";
import type { Task } from "../domain/task";
import type { TaskSort } from "../domain/sort";
import { DEFAULT_FILTERS } from "../domain/filters";
import {
  countActiveFilters,
  getUniqueFilterOptions,
  processTaskList,
} from "../utils/taskListUtils";
import { useTaskCollections } from "./useTaskCollections";
import { DEFAULT_PAGE_SIZE, type PageSize } from "../domain/others";

export function useTaskListState(tasksOverride?: Task[]) {
  const { tasks: storedTasks } = useTasks();
  const tasks = tasksOverride ?? storedTasks;
  const { collections, saveCollection, deleteCollection } =
    useTaskCollections();

  const [filters, setFiltersState] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<TaskFilters>(DEFAULT_FILTERS);
  const [sort, setSortState] = useState<TaskSort | null>(null);
  const [pageSize, setPageSizeState] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterOptions = useMemo(() => getUniqueFilterOptions(tasks), [tasks]);

  const filteredTotal = useMemo(() => {
    return processTaskList(tasks, {
      filters,
      sort,
      pageSize,
      page: 1,
    }).total;
  }, [filters, sort, pageSize, tasks]);

  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredTotal / pageSize) || 1),
  );

  const listResult = useMemo(
    () =>
      processTaskList(tasks, {
        filters,
        sort,
        pageSize,
        page: safePage,
      }),
    [filters, sort, pageSize, safePage, tasks],
  );

  const clearActiveCollection = useCallback(() => {
    setActiveCollectionId(null);
  }, []);

  const setFilters = useCallback(
    (updater: TaskFilters | ((prev: TaskFilters) => TaskFilters)) => {
      clearActiveCollection();
      setFiltersState(updater);
      setPage(1);
    },
    [clearActiveCollection],
  );

  const setSort = useCallback(
    (next: TaskSort | null) => {
      clearActiveCollection();
      setSortState(next);
      setPage(1);
    },
    [clearActiveCollection],
  );

  const setPageSize = useCallback(
    (next: PageSize) => {
      clearActiveCollection();
      setPageSizeState(next);
      setPage(1);
    },
    [clearActiveCollection],
  );

  const toggleSort = useCallback(
    (field: TaskSort["field"]) => {
      clearActiveCollection();
      setSortState((current) => {
        if (current?.field === field) {
          return {
            field,
            direction: current.direction === "asc" ? "desc" : "asc",
          };
        }
        return { field, direction: "asc" };
      });
      setPage(1);
    },
    [clearActiveCollection],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDraftFilters(DEFAULT_FILTERS);
    setSort(null);
    setPageSize(DEFAULT_PAGE_SIZE);
    setPage(1);
    setActiveCollectionId(null);
  }, [setFilters, setSort, setPageSize]);

  const openFilters = useCallback(() => {
    setDraftFilters(filters);
    setFiltersOpen(true);
  }, [filters]);

  const closeFilters = useCallback(() => {
    setDraftFilters(filters);
    setFiltersOpen(false);
  }, [filters]);

  const applyFilters = useCallback(() => {
    clearActiveCollection();
    setFiltersState((current) => ({
      ...draftFilters,
      search: current.search,
    }));
    setPage(1);
    setFiltersOpen(false);
  }, [clearActiveCollection, draftFilters]);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters((current) => ({
      ...DEFAULT_FILTERS,
      search: current.search,
    }));
  }, []);

  const applyCollection = useCallback(
    (collectionId: string) => {
      const collection = collections.find((item) => item.id === collectionId);
      if (!collection) return;

      setFiltersState(collection.filters);
      setDraftFilters(collection.filters);
      setSortState(collection.sort);
      setPageSizeState(collection.pageSize);
      setPage(1);
      setActiveCollectionId(collection.id);
    },
    [collections],
  );

  const handleSaveCollection = useCallback(
    (name: string, filtersToSave: TaskFilters = filters, activate = true) => {
      const collection = saveCollection(name, filtersToSave, sort, pageSize);
      if (collection && activate) {
        setActiveCollectionId(collection.id);
      }
      return collection;
    },
    [filters, sort, pageSize, saveCollection],
  );

  const stats = useMemo(() => {
    const inProgress = tasks.filter(
      (task) => task.status === "inProgress",
    ).length;
    const open = tasks.filter((task) => task.status === "open").length;
    return { total: tasks.length, inProgress, open };
  }, [tasks]);

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  return {
    filters,
    draftFilters,
    setFilters,
    setDraftFilters,
    sort,
    setSort,
    toggleSort,
    pageSize,
    setPageSize,
    page,
    setPage,
    filtersOpen,
    setFiltersOpen,
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
    stats,
    activeFilterCount,
  };
}
