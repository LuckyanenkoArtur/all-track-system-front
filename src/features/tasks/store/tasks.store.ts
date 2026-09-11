import { create } from "zustand";
import { taskService as taskServiceOld, taskServiceNew } from "../api/task-service";

// 1. Create a Tasks store
// 2. Create a TaskCollenctionStore

const taskService = taskServiceNew

const useTasksStore = create((set) => ({
  tasks: [],
  task: null,
  loading: false,

  getTasks: async () => {
    set({ loading: true });

    const tasks = await taskService.getTasks();

    set({
      tasks,
      loading: false,
    });
  },

  getTaskById: async (id: string) => {
    set({ loading: true });

    const task = await taskService.getTaskById(id);

    set({
      task,
      loading: false,
    });
  },

  
}));

export default useTasksStore;