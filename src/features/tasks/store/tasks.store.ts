import { create } from "zustand";

// 1. Create a Tasks store
// 2. Create a TaskCollenctionStore

const useTasksStore = create(() => ({
  tasks: [],
  //   increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  //   removeAllBears: () => set({ bears: 0 }),
  //   updateBears: (newBears) => set({ bears: newBears }),
}));

export default useTasksStore;
