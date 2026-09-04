import { useCallback, useState } from "react";
import { taskService } from "../api/task-service";
import type { TaskFilters } from "../domain/filters";
import type { TaskSort } from "../domain/sort";
import type { PageSize } from "../domain/others";

export function useTaskCollections() {
  const [collections, setCollections] = useState(() =>
    taskService.getCollections(),
  );

  const saveCollection = useCallback(
    (
      name: string,
      filters: TaskFilters,
      sort: TaskSort | null,
      pageSize: PageSize,
    ) => {
      const collection = taskService.saveCollection(
        name,
        filters,
        sort,
        pageSize,
      );
      setCollections(taskService.getCollections());
      return collection;
    },
    [],
  );

  const deleteCollection = useCallback((id: string) => {
    taskService.deleteCollection(id);
    setCollections(taskService.getCollections());
  }, []);

  return { collections, saveCollection, deleteCollection };
}
